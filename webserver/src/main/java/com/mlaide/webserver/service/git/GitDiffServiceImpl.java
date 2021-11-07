package com.mlaide.webserver.service.git;

import com.mlaide.webserver.model.GitDiff;
import lombok.SneakyThrows;
import org.apache.commons.io.FileUtils;
import org.apache.sshd.common.SshException;
import org.eclipse.jgit.api.FetchCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.TransportConfigCallback;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.diff.DiffEntry;
import org.eclipse.jgit.diff.DiffFormatter;
import org.eclipse.jgit.errors.TransportException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectReader;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.transport.CredentialsProvider;
import org.eclipse.jgit.transport.RefSpec;
import org.eclipse.jgit.transport.SshTransport;
import org.eclipse.jgit.transport.Transport;
import org.eclipse.jgit.transport.sshd.ServerKeyDatabase;
import org.eclipse.jgit.transport.sshd.SshdSessionFactory;
import org.eclipse.jgit.treewalk.CanonicalTreeParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPair;
import java.security.PublicKey;
import java.util.List;

import static java.util.Collections.emptyList;

@Service
public class GitDiffServiceImpl implements GitDiffService {
    private final Logger logger = LoggerFactory.getLogger(GitDiffServiceImpl.class);

    @SneakyThrows(IOException.class)
    @Override
    public GitDiff getDiff(String repositoryUri, String commitHash1, String commitHash2, List<KeyPair> keyPairs) {
        File tempDirectory = Files.createTempDirectory("mlaide-git-").toFile();
        logger.info("Cloning git repository for diff to {}", tempDirectory);

        try (Repository repository = getRepository(repositoryUri, keyPairs, tempDirectory)) {

            ObjectId head1 = repository.resolve(commitHash1 + "^{tree}");
            ObjectId head2 = repository.resolve(commitHash2 + "^{tree}");

            try (ObjectReader reader = repository.newObjectReader()) {
                CanonicalTreeParser treeParser1 = new CanonicalTreeParser();
                treeParser1.reset(reader, head1);

                CanonicalTreeParser treeParser2 = new CanonicalTreeParser();
                treeParser2.reset(reader, head2);

                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                try (DiffFormatter formatter = new DiffFormatter(outputStream)) {
                    formatter.setRepository(repository);
                    List<DiffEntry> diffs = formatter.scan(treeParser1, treeParser2);

                    for (DiffEntry entry : diffs) {
                        formatter.format(entry);
                    }

                    String result = outputStream.toString();
                    return new GitDiff(result);
                }
            }

        } catch (GitAPIException e) {
            if (e.getCause() != null
                    && e.getCause() instanceof TransportException
                    && e.getCause().getCause() != null
                    && e.getCause().getCause() instanceof SshException) {
                logger.info("Could not create git diff repository. No SSH key available to access the repository.");
                throw new GitRepositoryAccessDenied(e);
            }

            throw new GitDiffException(e);
        } finally {
            FileUtils.deleteDirectory(tempDirectory);
        }
    }

    private Repository getRepository(String repositoryUri, List<KeyPair> keyPairs, File targetDirectory) throws GitAPIException, IOException {
        Repository repository = new FileRepositoryBuilder()
                .setWorkTree(targetDirectory)
                .readEnvironment()
                .findGitDir()
                .build();

        fetchGitRepository(repository, repositoryUri, keyPairs);

        return repository;
    }

    private void fetchGitRepository(Repository repository, String repositoryUri, List<KeyPair> keyPairs) throws GitAPIException {
        repository.getObjectDatabase();

        try (Git git = new Git(repository)) {
            FetchCommand fetchCommand = git.fetch()
                    .setRemote(repositoryUri)
                    .setRefSpecs(new RefSpec("+refs/heads/*:refs/heads/*"));

            if (keyPairs != null) {
                SshTransportConfigCallback transportConfigCallback = new SshTransportConfigCallback(keyPairs);
                fetchCommand.setTransportConfigCallback(transportConfigCallback);
            }

            fetchCommand.call();
        }
    }

    private SshdSessionFactory getFactory(List<KeyPair> keyPairs) {
        return new InMemorySessionFactory(keyPairs);
    }

    private static class InMemorySessionFactory extends SshdSessionFactory {
        private final Iterable<KeyPair> keyPairs;

        private InMemorySessionFactory(Iterable<KeyPair> keyPairs) {
            this.keyPairs = keyPairs;
        }

        @Override
        public File getHomeDirectory() {
            return null;
        }

        @Override
        public File getSshDirectory() {
            return null;
        }

        @Override
        protected File getSshConfig(File sshDir) {
            return null;
        }

        @Override
        protected ServerKeyDatabase getServerKeyDatabase(File homeDir, File sshDir) {
            return new ServerKeyDatabase() {
                @Override
                public List<PublicKey> lookup(String connectAddress, InetSocketAddress remoteAddress, Configuration config) {
                    return emptyList();
                }

                @Override
                public boolean accept(String connectAddress, InetSocketAddress remoteAddress, PublicKey serverKey, Configuration config, CredentialsProvider provider) {
                    return true; // TODO: Should we really accept all server keys?
                }
            };
        }

        @Override
        protected List<Path> getDefaultKnownHostsFiles(File sshDir) {
            return emptyList();
        }

        @Override
        protected Iterable<KeyPair> getDefaultKeys(File sshDir) {
            return keyPairs;
        }
    }

    private class SshTransportConfigCallback implements TransportConfigCallback {
        private final List<KeyPair> keyPairs;

        public SshTransportConfigCallback(List<KeyPair> keyPairs) {
            this.keyPairs = keyPairs;
        }

        @Override
        public void configure(Transport transport) {
            if (transport instanceof SshTransport) {
                SshTransport sshTransport = (SshTransport) transport;
                sshTransport.setSshSessionFactory(getFactory(keyPairs));
            }
        }
    }
}

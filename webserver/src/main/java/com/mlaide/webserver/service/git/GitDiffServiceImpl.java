package com.mlaide.webserver.service.git;

import com.mlaide.webserver.model.GitDiff;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.diff.DiffEntry;
import org.eclipse.jgit.diff.DiffFormatter;
import org.eclipse.jgit.internal.storage.dfs.DfsRepositoryDescription;
import org.eclipse.jgit.internal.storage.dfs.InMemoryRepository;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectReader;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.transport.RefSpec;
import org.eclipse.jgit.treewalk.CanonicalTreeParser;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class GitDiffServiceImpl implements GitDiffService {
    @Override
    public GitDiff getDiff(String repositoryUri, String commitHash1, String commitHash2) {
        try (Repository repository = getRepository(repositoryUri)) {

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

        } catch (IOException | GitAPIException e) {
            throw new GitDiffException(e);
        }
    }

    private String getGitRepositoryUri(String uri) {
        if (uri.startsWith("git@")) {
            uri = uri.replaceFirst(":", "/")
                    .replaceFirst("git@", "https://");
        }

        return uri;
    }

    private Repository getRepository(String repositoryUri) throws GitAPIException {
        DfsRepositoryDescription repoDesc = new DfsRepositoryDescription();
        var repository = new InMemoryRepository(repoDesc);

        fetchGitRepository(repository, repositoryUri);

        return repository;
    }

    private void fetchGitRepository(Repository repository, String repositoryUri) throws GitAPIException {
        repository.getObjectDatabase();

        repositoryUri = getGitRepositoryUri(repositoryUri);

        try (Git git = new Git(repository)) {
            git.fetch()
                    .setRemote(repositoryUri)
                    .setRefSpecs(new RefSpec("+refs/heads/*:refs/heads/*"))
                    .call();
        }
    }
}

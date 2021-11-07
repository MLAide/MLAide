package com.mlaide.webserver.service.mapper;

import com.mlaide.webserver.model.SshKey;
import com.mlaide.webserver.repository.entity.SshKeyEntity;
import lombok.SneakyThrows;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Mapper(uses = CommonDataTypeMapper.class, componentModel = "spring")
public interface SshKeyMapper {
    @Mapping(source = "publicKey", target = "publicKey", qualifiedByName = "X509ToOpenSSH")
    SshKey fromEntity(SshKeyEntity sshKeyEntity);

    @SneakyThrows({IOException.class, NoSuchAlgorithmException.class, InvalidKeySpecException.class})
    @Named("X509ToOpenSSH")
    public static String x509ToOpenSSH(byte[] bytes) {
        X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(bytes);
        RSAPublicKey publicKey = (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(publicKeySpec);

        // Convert the public key to the OpenSSH format
        // https://gist.github.com/wernerb/3795be58d27829512272#file-genssh-scala-L31
        var byteOs = new ByteArrayOutputStream();
        var dos = new DataOutputStream(byteOs);
        dos.writeInt("ssh-rsa".getBytes().length);
        dos.write("ssh-rsa".getBytes());
        dos.writeInt(publicKey.getPublicExponent().toByteArray().length);
        dos.write(publicKey.getPublicExponent().toByteArray());
        dos.writeInt(publicKey.getModulus().toByteArray().length);
        dos.write(publicKey.getModulus().toByteArray());
        return "ssh-rsa " + Base64.getEncoder().encodeToString(byteOs.toByteArray());
    }
}

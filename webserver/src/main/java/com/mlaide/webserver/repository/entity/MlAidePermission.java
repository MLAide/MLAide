package com.mlaide.webserver.repository.entity;

import org.springframework.security.acls.domain.AbstractPermission;

public class MlAidePermission extends AbstractPermission {
    public static final MlAidePermission VIEWER = new MlAidePermission(1 << 0, 'R'); // 1
    public static final MlAidePermission CONTRIBUTOR = new MlAidePermission(1 << 1, 'C'); // 2
    public static final MlAidePermission OWNER = new MlAidePermission(1 << 2, 'O'); // 4

    protected MlAidePermission(int mask) {
        super(mask);
    }

    protected MlAidePermission(int mask, char code) {
        super(mask, code);
    }
}

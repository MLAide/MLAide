package com.mlaide.webserver.repository.entity;

import org.springframework.security.acls.domain.AbstractPermission;

public class MvcPermission extends AbstractPermission {
    public static final MvcPermission VIEWER = new MvcPermission(1 << 0, 'R'); // 1
    public static final MvcPermission CONTRIBUTOR = new MvcPermission(1 << 1, 'C'); // 2
    public static final MvcPermission OWNER = new MvcPermission(1 << 2, 'O'); // 4

    protected MvcPermission(int mask) {
        super(mask);
    }

    protected MvcPermission(int mask, char code) {
        super(mask, code);
    }
}

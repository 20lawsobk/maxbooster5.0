{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.npm
    pkgs.nodePackages.typescript
    pkgs.nodePackages.tsx
    pkgs.postgresql_15
    pkgs.redis
    pkgs.git
    pkgs.curl
    pkgs.wget
  ];
}




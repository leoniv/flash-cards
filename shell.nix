{ pkgs ? import <nixpkgs> {} }:

let
  isCI = (builtins.getEnv "CI") == "true";
  isCIs = if isCI then "true" else "false";
in
pkgs.mkShell {
  packages = with pkgs; [
    nodejs
    nodePackages.typescript
  ] ++ ( if isCI then [
      cacert
    ] else [
      nodePackages.eslint
      nodePackages.prettier
      nodePackages.typescript-language-server
    ]
  );

  shellHook = ''
    echo isCI = ${isCIs}
  '' + ( if isCI then ''
    export SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt
    export NIX_SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt
    export NODE_OPTIONS="--use-openssl-ca $NODE_OPTIONS"
  '' else ''
    alias yarn="corepack yarn"
    alias pnpm="corepack pnpm"
  ''
  );
}

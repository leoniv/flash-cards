{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  packages = with pkgs; [
    go
    nodejs
    nodePackages.typescript
    nodePackages.eslint
    nodePackages.prettier
    nodePackages.typescript-language-server
  ];

  shellHook = ''
    alias yarn="corepack yarn"
    alias pnpm="corepack pnpm"
    echo "Go is ready! Install packages with: go install <package>@latest"
  '';
}

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
    echo "Go is ready! Install packages with: go install <package>@latest"
  '';
}

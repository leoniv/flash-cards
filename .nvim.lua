local lspconfig = require("lspconfig")

lspconfig.ts_ls.setup{
  cmd = { vim.fn.exepath("typescript-language-server"), "--stdio" },
  root_dir = lspconfig.util.root_pattern("tsconfig.json", "package.json", ".git"),
  filetypes = { "javascript", "javascriptreact", "javascript.jsx",
                "typescript", "typescriptreact", "typescript.tsx" },
}

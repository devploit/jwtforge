import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**"],
  },
  {
    // The React Compiler (new in Next 16) flags two idiomatic patterns we use
    // deliberately: deriving a client-only value after mount (setState in an
    // effect, to avoid SSR/hydration mismatch on Date and localStorage) and
    // syncing editor buffers when the decoded token changes. These are correct
    // here, so we surface them as warnings rather than hard errors.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;

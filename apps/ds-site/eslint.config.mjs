import dsConfig from "@ds/eslint-config";

export default [
  ...dsConfig,
  {
    ignores: [".next/**", "out/**"],
  },
];

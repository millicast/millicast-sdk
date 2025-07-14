const rootConfig = require("../../eslint.config.js");
const jsoncParser = require('jsonc-eslint-parser');

module.exports = [
  ...rootConfig,
  {
    ignores: [
      "!**/*",
      "/src/drm/*",
      "package.json",
      "docs/",
      "*.d.ts",
      "jest.config.ts",
    ],
  },
  {
    files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
    rules: {}
  },
  {
    files: ["*.ts", "*.tsx"],
    rules: {
      "@typescript-eslint/no-inferrable-types": "off"
    }
  },
  {
    files: ["*.js", "*.jsx"],
    rules: {}
  },
  {
    files: [
      "*.spec.ts",
      "*.spec.tsx",
      "*.spec.js",
      "*.spec.jsx",
      "*.steps.js",
      "*.test.js",
      "*/tests/**"
    ],
    languageOptions: {
			globals: {
        "jest": true
			},
		},
    rules: {}
  },
  {
    files: ["*.json"],
    languageOptions: {
			parser: jsoncParser,
		},
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: ["{projectRoot}/vite.config.{js,ts,mjs,mts}"]
        }
      ]
    }
  }
];

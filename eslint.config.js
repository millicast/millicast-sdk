const nxPlugin = require("@nx/eslint-plugin");
const tseslint = require("@typescript-eslint/eslint-plugin");

module.exports = [
  {
    plugins: {
      "@nx": nxPlugin,
      '@typescript-eslint': tseslint,
    }
  },
  {
    ignores: [
      ".vscode",
      ".github",
      "/**/*.d.ts",
      "/**/node_modules/**",
      "dist",
      "coverage/**",
      "docs",
      "packages/millicast-publisher-demo",
      "packages/millicast-viewer-demo",
      "packages/millicast-chromecast-receiver",
      "packages/millicast-multiview-demo",
      "/**/src/*.worker.js",
      "/**/rtc-drm-transform.min.js",
    ],
  },
  {
    files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: "*",
              onlyDependOnLibsWithTags: ["*"]
            }
          ]
        }
      ]
    }
  },
  {
    files: ["*.ts", "*.tsx"],
    rules: {}
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
      "**/__mocks__/**"
    ],
    languageOptions: {
			globals: {
        "jest": true
			},
		},
    rules: {
      "@typescript-eslint/no-empty-function": [
        "error",
        {
          allow: [
            "functions", // Allows regular function declarations
            "arrowFunctions", // Allows empty arrow functions
            "methods", // Allows empty methods (e.g., in classes)
            "constructors", // Allows empty constructors
            "private-constructors", // Allows empty private constructors
            "protected-constructors" // Allows empty protected constructors
          ]
        }
      ]
    }
  }
];

// https://eslint.org/docs/latest/user-guide/configuring
module.exports = {
    // https://eslint.org/docs/latest/user-guide/configuring/language-options#specifying-environments
    "env": {
        "browser": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    // https://eslint.org/docs/latest/user-guide/configuring/rules
    "rules": {
        "semi": ["error", "always"],        // https://eslint.org/docs/latest/rules/semi
        "quotes": ["warn", "double"]        // https://eslint.org/docs/latest/rules/quotes
    }
};

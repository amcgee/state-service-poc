**DON'T USE THIS**, it's just a proof-of-concept

Note that in Debug mode (with `yarn start`) react [will double-render any component using Hooks by design](https://github.com/facebook/react/issues/15074#issuecomment-471197572).

Running the sample app in production (`yarn build && npx serve build`) will show the correct render counter values (incrementing by 1 when selected state changes)

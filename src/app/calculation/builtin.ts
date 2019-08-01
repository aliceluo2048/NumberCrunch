const functions: {} = {}
const variables: {} = {
    "E": Math.E,
    "pi": Math.PI
} 


function addBuiltinFunc(name: string, func: any, argCount?: number) {
    functions[name] = {
      argCount: argCount,
      tree: { op: "builtin", func: func }
    };
  }

addBuiltinFunc("exp", (args: number[]) => Math.exp(args[0]), 1);
addBuiltinFunc("log", (args: number[]) => Math.log(args[0]), 1);
addBuiltinFunc("sqrt", (args: number[]) => Math.sqrt(args[0]), 1);
addBuiltinFunc("sin", (args: number[]) => Math.sin(args[0]), 1);
addBuiltinFunc("cos", (args: number[]) => Math.cos(args[0]), 1);
addBuiltinFunc("tan", (args: number[]) => Math.tan(args[0]), 1);
addBuiltinFunc("asin", (args: number[]) => Math.asin(args[0]), 1);
addBuiltinFunc("acos", (args: number[]) => Math.acos(args[0]), 1);
addBuiltinFunc("atan", (args: number[]) => Math.atan(args[0]), 1);
addBuiltinFunc("average", (args: number[]) => args.reduce((a,b) => a + b, 0) / args.length);
addBuiltinFunc("max", (args: number[]) => Math.max(...args));
addBuiltinFunc("min", (args: number[]) => Math.min(...args));

export { functions, variables }
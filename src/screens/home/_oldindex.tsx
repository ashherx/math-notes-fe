// import { useEffect, useRef, useState } from "react";
// import { SWATCHES } from "../../../constants";
// import { ColorSwatch, Group } from "@mantine/core";
// import { Button } from "@mantine/core";
// import Draggable from "react-draggable";

// import axios from "axios";

// interface Response {
//   expr: string;
//   result: string;
//   assign: boolean;
// }

// interface GeneratedResult {
//   expression: string;
//   answer: string;
// }

// export default function Home() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [color, setColor] = useState("white");
//   const [reset, setReset] = useState(false);
//   const [result, setResult] = useState<GeneratedResult>();
//   const [latexExpression, setLatexExpression] = useState<Array<string>>([]);
//   const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
//   const [dictOfVars, setDictOfVars] = useState({});

//   useEffect(() => {
//     if (latexExpression.length > 0 && window.MathJax) {
//       setTimeout(() => {
//         window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
//       }, 0);
//     }
//   }, [latexExpression]);

//   useEffect(() => {
//     if (result) {
//       renderLatexToCanvas(result.expression, result.answer);
//     }
//   }, [result]);

//   useEffect(() => {
//     if (reset) {
//       resetCanvas();
//       setLatexExpression([]);
//       setResult(undefined);
//       setDictOfVars({});
//       setReset(false);
//     }
//   }, [reset]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (canvas) {
//       const ctx = canvas.getContext("2d");
//       if (ctx) {
//         canvas.width = window.innerWidth;
//         canvas.height = window.innerHeight - canvas.offsetTop;
//         ctx.lineWidth = 3;
//       }
//     }

//     const script = document.createElement("script");
//     script.src =
//       "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
//     script.async = true;
//     document.head.appendChild(script);

//     script.onload = () => {
//       window.MathJax.Hub.Config({
//         tex2jax: {
//           inlineMath: [
//             ["$", "$"],
//             ["\\(", "\\)"],
//           ],
//         },
//       });
//     };

//     return () => {
//       document.head.removeChild(script);
//     };
//   }, []);

//   const renderLatexToCanvas = (expression: string, answer: string) => {
//     const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
//     setLatexExpression([...latexExpression, latex]);

//     // Clear the main canvas
//     const canvas = canvasRef.current;
//     if (canvas) {
//       const ctx = canvas.getContext("2d");
//       if (ctx) {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//       }
//     }
//   };

//   const sendData = async () => {
//     const canvas = canvasRef.current;
//     if (canvas) {
//       const ctx = canvas.getContext("2d");
//       if (ctx) {
//         const response = await axios({
//           method: "post",
//           url: `${import.meta.env.VITE_API_URL}/calculate`,
//           data: {
//             image: canvas.toDataURL("image/png"),
//             dict_of_vars: dictOfVars,
//           },
//         });

//         const resp = await response.data;
//         console.log("Response: ", resp);
//         resp.data.forEach((data: Response) => {
//           if (data.assign === true) {
//             setDictOfVars({ ...dictOfVars, [data.expr]: data.result });
//           } else {
//             setResult({ expression: data.expr, answer: data.result });
//           }
//         });

//         const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
//         let minX = canvas.width,
//           minY = canvas.height,
//           maxX = 0,
//           maxY = 0;

//         for (let y = 0; y < canvas.height; y++) {
//           for (let x = 0; x < canvas.width; x++) {
//             const i = (y * canvas.width + x) * 4;
//             if (imageData.data[i + 3] > 0) {
//               // If pixel is not transparent
//               minX = Math.min(minX, x);
//               minY = Math.min(minY, y);
//               maxX = Math.max(maxX, x);
//               maxY = Math.max(maxY, y);
//             }
//           }
//         }

//         const centerX = (minX + maxX) / 2;
//         const centerY = (minY + maxY) / 2;

//         setLatexPosition({ x: centerX, y: centerY });
//         resp.data.forEach((data: Response) => {
//           setTimeout(() => {
//             setResult({
//               expression: data.expr,
//               answer: data.result,
//             });
//           }, 1000);
//         });
//       }
//     }
//   };

//   const resetCanvas = () => {
//     const canvas = canvasRef.current;
//     if (canvas) {
//       const ctx = canvas.getContext("2d");
//       if (ctx) {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//       }
//     }
//   };

//   const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
//     const canvas = canvasRef.current;
//     if (canvas) {
//       canvas.style.backgroundColor = "black";
//       const ctx = canvas.getContext("2d");
//       if (ctx) {
//         ctx.beginPath();
//         ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
//         setIsDrawing(true);
//       }
//     }
//   };

//   const stopDrawing = () => {
//     setIsDrawing(false);
//   };

//   const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
//     if (!isDrawing) return;

//     const canvas = canvasRef.current;
//     if (canvas) {
//       const ctx = canvas.getContext("2d");
//       if (ctx) {
//         ctx.strokeStyle = color;
//         ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
//         ctx.stroke();
//       }
//     }
//   };

//   return (
//     <>
//       <div className="grid grid-cols-3 gap-2">
//         <Button
//           onClick={() => setReset(true)}
//           className="z-20 bg-black text-white"
//           variant="default"
//           color="black"
//         >
//           Reset
//         </Button>

//         <Group className="z-20">
//           {SWATCHES.map((swatch) => (
//             <ColorSwatch
//               key={swatch}
//               color={swatch}
//               onClick={() => setColor(swatch)}
//             />
//           ))}
//         </Group>

//         <Button
//           onClick={sendData}
//           className="z-20 bg-black text-white"
//           variant="default"
//           color="black"
//         >
//           Calculate
//         </Button>
//       </div>
//       <canvas
//         ref={canvasRef}
//         id="canvas"
//         className="absolute top-0 left-0 w-full h-full bg-black"
//         onMouseDown={startDrawing}
//         onMouseMove={draw}
//         onMouseUp={stopDrawing}
//         onMouseOut={stopDrawing}
//       />

//       {latexExpression &&
//         latexExpression.map((latex, index) => (
//           <Draggable
//             key={index}
//             defaultPosition={latexPosition}
//             onStop={(data) => setLatexPosition({ x: data.x, y: data.y })}
//           >
//             <div className="absolute p-2 text-white rounded shadow-md">
//               <div className="latex-content">{latex}</div>
//             </div>
//           </Draggable>
//         ))}
//     </>
//   );
// }

// // import { useEffect, useRef, useState } from "react";
// // import { SWATCHES } from "../../../constants";
// // import { ColorSwatch, Group } from "@mantine/core";
// // import { Button } from "@mantine/core";
// // import Draggable from "react-draggable";
// // import axios from "axios";

// // interface Response {
// //   expr: string;
// //   result: string;
// //   assign: boolean;
// // }

// // interface GeneratedResult {
// //   expression: string;
// //   answer: string;
// // }

// // export default function Home() {
// //   const canvasRef = useRef<HTMLCanvasElement>(null);
// //   const [isDrawing, setIsDrawing] = useState(false);
// //   const [color, setColor] = useState("white");
// //   const [reset, setReset] = useState(false);
// //   const [strokes, setStrokes] = useState<
// //     Array<{ path: Path2D; color: string }>
// //   >([]);
// //   const [result, setResult] = useState<GeneratedResult>();
// //   const [latexExpression, setLatexExpression] = useState<Array<string>>([]);
// //   const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
// //   const [dictOfVars, setDictOfVars] = useState({});

// //   useEffect(() => {
// //     if (latexExpression.length > 0 && window.MathJax) {
// //       setTimeout(() => {
// //         window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
// //       }, 0);
// //     }
// //   }, [latexExpression]);

// //   useEffect(() => {
// //     if (result) {
// //       renderLatexToCanvas(result.expression, result.answer);
// //     }
// //   }, [result]);

// //   useEffect(() => {
// //     if (reset) {
// //       resetCanvas();
// //       setLatexExpression([]);
// //       setResult(undefined);
// //       setDictOfVars({});
// //       setReset(false);
// //     }
// //   }, [reset]);

// //   useEffect(() => {
// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         canvas.width = window.innerWidth;
// //         canvas.height = window.innerHeight - canvas.offsetTop;
// //         ctx.lineWidth = 3;
// //       }
// //     }

// //     const script = document.createElement("script");
// //     script.src =
// //       "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
// //     script.async = true;
// //     document.head.appendChild(script);

// //     script.onload = () => {
// //       window.MathJax.Hub.Config({
// //         tex2jax: {
// //           inlineMath: [
// //             ["$", "$"],
// //             ["\\(", "\\)"],
// //           ],
// //         },
// //       });
// //     };

// //     return () => {
// //       document.head.removeChild(script);
// //     };
// //   }, []);

// //   const renderLatexToCanvas = (expression: string, answer: string) => {
// //     const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
// //     setLatexExpression([...latexExpression, latex]);

// //     // Clear the main canvas
// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         ctx.clearRect(0, 0, canvas.width, canvas.height);
// //       }
// //     }
// //   };

// //   const sendData = async () => {
// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         const response = await axios({
// //           method: "post",
// //           url: `${import.meta.env.VITE_API_URL}/calculate`,
// //           data: {
// //             image: canvas.toDataURL("image/png"),
// //             dict_of_vars: dictOfVars,
// //           },
// //         });

// //         const resp = await response.data;
// //         console.log("Response: ", resp);
// //         resp.data.forEach((data: Response) => {
// //           if (data.assign === true) {
// //             setDictOfVars({ ...dictOfVars, [data.expr]: data.result });
// //           } else {
// //             setResult({ expression: data.expr, answer: data.result });
// //           }
// //         });

// //         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// //         let minX = canvas.width,
// //           minY = canvas.height,
// //           maxX = 0,
// //           maxY = 0;

// //         for (let y = 0; y < canvas.height; y++) {
// //           for (let x = 0; x < canvas.width; x++) {
// //             const i = (y * canvas.width + x) * 4;
// //             if (imageData.data[i + 3] > 0) {
// //               // If pixel is not transparent
// //               minX = Math.min(minX, x);
// //               minY = Math.min(minY, y);
// //               maxX = Math.max(maxX, x);
// //               maxY = Math.max(maxY, y);
// //             }
// //           }
// //         }

// //         const centerX = (minX + maxX) / 2;
// //         const centerY = (minY + maxY) / 2;

// //         setLatexPosition({ x: centerX, y: centerY });
// //         resp.data.forEach((data: Response) => {
// //           setTimeout(() => {
// //             setResult({
// //               expression: data.expr,
// //               answer: data.result,
// //             });
// //           }, 1000);
// //         });
// //       }
// //     }
// //   };

// //   const resetCanvas = () => {
// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         ctx.clearRect(0, 0, canvas.width, canvas.height);
// //         setStrokes([]); // Reset strokes when resetting canvas
// //       }
// //     }
// //   };

// //   // Redraw all strokes on canvas
// //   const redraw = () => {
// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         ctx.clearRect(0, 0, canvas.width, canvas.height);
// //         strokes.forEach((stroke) => {
// //           ctx.strokeStyle = stroke.color;
// //           ctx.stroke(stroke.path);
// //         });
// //       }
// //     }
// //   };

// //   const undoLastStroke = () => {
// //     setStrokes(strokes.slice(0, -1));
// //     redraw();
// //   };

// //   useEffect(() => {
// //     redraw();
// //   }, [strokes]);

// //   // Other useEffect hooks remain unchanged...

// //   const startDrawing = (
// //     e: React.MouseEvent<HTMLCanvasElement>
// //   ) => {
// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         const offsetX =
// //           e.nativeEvent instanceof MouseEvent
// //             ? e.nativeEvent.offsetX
// //             : e.touches[0].clientX - canvas.getBoundingClientRect().left; // Get touch position

// //         const offsetY =
// //           e.nativeEvent instanceof MouseEvent
// //             ? e.nativeEvent.offsetY
// //             : e.touches[0].clientY - canvas.getBoundingClientRect().top; // Get touch position

// //         const path = new Path2D();
// //         path.moveTo(offsetX, offsetY);
// //         setStrokes([...strokes, { path, color }]); // Store the new stroke
// //         setIsDrawing(true);
// //       }
// //     }
// //   };

// //   const draw = (
// //     e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
// //   ) => {
// //     if (!isDrawing) return;

// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         const lastStroke = strokes[strokes.length - 1];
// //         if (lastStroke) {
// //           const offsetX =
// //             e.nativeEvent instanceof MouseEvent
// //               ? e.nativeEvent.offsetX
// //               : e.touches[0].clientX - canvas.getBoundingClientRect().left;

// //           const offsetY =
// //             e.nativeEvent instanceof MouseEvent
// //               ? e.nativeEvent.offsetY
// //               : e.touches[0].clientY - canvas.getBoundingClientRect().top;

// //           lastStroke.path.lineTo(offsetX, offsetY);
// //           ctx.strokeStyle = lastStroke.color;
// //           ctx.stroke(lastStroke.path);
// //         }
// //       }
// //     }
// //   };

// //   const stopDrawing = () => {
// //     setIsDrawing(false);
// //   };

// //   return (
// //     <>
// //       <div className="absolute w-full z-10 flex justify-center">
// //         <div
// //           className="flex flex-col sm:flex-row gap-2 p-4 bg-white bg-opacity-80"
// //           style={{ top: 10 }}
// //         >
// //           <Button
// //             onClick={() => setReset(true)}
// //             className="bg-black text-white"
// //           >
// //             Reset
// //           </Button>
// //           <Button onClick={undoLastStroke} className="bg-black text-white">
// //             Undo
// //           </Button>

// //           <Group className="flex flex-wrap justify-center sm:justify-start">
// //             {SWATCHES.map((swatch) => (
// //               <ColorSwatch
// //                 key={swatch}
// //                 color={swatch}
// //                 onClick={() => setColor(swatch)}
// //               />
// //             ))}
// //           </Group>

// //           <Button onClick={sendData} className="bg-black text-white">
// //             Calculate
// //           </Button>
// //         </div>
// //       </div>

// //       <canvas
// //         ref={canvasRef}
// //         id="canvas"
// //         className="absolute top-0 left-0 w-full h-full bg-black"
// //         onMouseDown={startDrawing}
// //         onMouseMove={draw}
// //         onMouseUp={stopDrawing}
// //         onMouseOut={stopDrawing}
// //         onTouchStart={startDrawing} // Add touch event handlers
// //         onTouchMove={draw}
// //         onTouchEnd={stopDrawing}
// //         onTouchCancel={stopDrawing} // Handle touch cancel
// //       />

// //       {latexExpression &&
// //         latexExpression.map((latex, index) => (
// //           <Draggable
// //             key={index}
// //             defaultPosition={latexPosition}
// //             onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
// //           >
// //             <div className="absolute p-2 text-white rounded shadow-md">
// //               <div className="latex-content">{latex}</div>
// //             </div>
// //           </Draggable>
// //         ))}
// //     </>
// //   );
// // }

// // import { useEffect, useRef, useState } from "react";
// // import { SWATCHES } from "../../../constants";
// // import { ColorSwatch, Group } from "@mantine/core";
// // import { Button } from "@mantine/core";
// // import Draggable from "react-draggable";
// // import axios from "axios";

// // interface Response {
// //   expr: string;
// //   result: string;
// //   assign: boolean;
// // }

// // interface GeneratedResult {
// //   expression: string;
// //   answer: string;
// // }

// // export default function Home() {
// //   const canvasRef = useRef<HTMLCanvasElement>(null);
// //   const [isDrawing, setIsDrawing] = useState(false);
// //   const [color, setColor] = useState("white");
// //   const [reset, setReset] = useState(false);
// //   const [strokes, setStrokes] = useState<
// //     Array<{ path: Path2D; color: string }>
// //   >([]);
// //   const [result, setResult] = useState<GeneratedResult>();
// //   const [latexExpression, setLatexExpression] = useState<Array<string>>([]);
// //   const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
// //   const [dictOfVars, setDictOfVars] = useState({});

// //   useEffect(() => {
// //     if (latexExpression.length > 0 && window.MathJax) {
// //       setTimeout(() => {
// //         window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
// //       }, 0);
// //     }
// //   }, [latexExpression]);

// //   useEffect(() => {
// //     if (result) {
// //       renderLatexToCanvas(result.expression, result.answer);
// //     }
// //   }, [result]);

// //   useEffect(() => {
// //     if (reset) {
// //       resetCanvas();
// //       setLatexExpression([]);
// //       setResult(undefined);
// //       setDictOfVars({});
// //       setReset(false);
// //     }
// //   }, [reset]);
// //   useEffect(() => {
// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         canvas.width = window.innerWidth;
// //         canvas.height = window.innerHeight - canvas.offsetTop;
// //         ctx.lineWidth = 3;
// //       }
// //     }

// //     const script = document.createElement("script");
// //     script.src =
// //       "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
// //     script.async = true;
// //     document.head.appendChild(script);

// //     script.onload = () => {
// //       window.MathJax.Hub.Config({
// //         tex2jax: {
// //           inlineMath: [
// //             ["$", "$"],
// //             ["\\(", "\\)"],
// //           ],
// //         },
// //       });
// //     };

// //     return () => {
// //       document.head.removeChild(script);
// //     };
// //   }, []);

// //   const renderLatexToCanvas = (expression: string, answer: string) => {
// //     const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
// //     setLatexExpression([...latexExpression, latex]);

// //     // Clear the main canvas
// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         ctx.clearRect(0, 0, canvas.width, canvas.height);
// //       }
// //     }
// //   };

// //   const sendData = async () => {
// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         const response = await axios({
// //           method: "post",
// //           url: `${import.meta.env.VITE_API_URL}/calculate`,
// //           data: {
// //             image: canvas.toDataURL("image/png"),
// //             dict_of_vars: dictOfVars,
// //           },
// //         });

// //         const resp = await response.data;
// //         console.log("Response: ", resp);
// //         resp.data.forEach((data: Response) => {
// //           if (data.assign === true) {
// //             setDictOfVars({ ...dictOfVars, [data.expr]: data.result });
// //           } else {
// //             setResult({ expression: data.expr, answer: data.result });
// //           }
// //         });

// //         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// //         let minX = canvas.width,
// //           minY = canvas.height,
// //           maxX = 0,
// //           maxY = 0;

// //         for (let y = 0; y < canvas.height; y++) {
// //           for (let x = 0; x < canvas.width; x++) {
// //             const i = (y * canvas.width + x) * 4;
// //             if (imageData.data[i + 3] > 0) {
// //               // If pixel is not transparent
// //               minX = Math.min(minX, x);
// //               minY = Math.min(minY, y);
// //               maxX = Math.max(maxX, x);
// //               maxY = Math.max(maxY, y);
// //             }
// //           }
// //         }

// //         const centerX = (minX + maxX) / 2;
// //         const centerY = (minY + maxY) / 2;

// //         setLatexPosition({ x: centerX, y: centerY });
// //         resp.data.forEach((data: Response) => {
// //           setTimeout(() => {
// //             setResult({
// //               expression: data.expr,
// //               answer: data.result,
// //             });
// //           }, 1000);
// //         });
// //       }
// //     }
// //   };

// //   const resetCanvas = () => {
// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         ctx.clearRect(0, 0, canvas.width, canvas.height);
// //         setStrokes([]); // Reset strokes when resetting canvas
// //       }
// //     }
// //   };

// //   // Redraw all strokes on canvas
// //   const redraw = () => {
// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         ctx.clearRect(0, 0, canvas.width, canvas.height);
// //         strokes.forEach((stroke) => {
// //           ctx.strokeStyle = stroke.color;
// //           ctx.stroke(stroke.path);
// //         });
// //       }
// //     }
// //   };

// //   const undoLastStroke = () => {
// //     setStrokes(strokes.slice(0, -1));
// //     redraw();
// //   };

// //   useEffect(() => {
// //     redraw();
// //   }, [strokes]);

// //   const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         const path = new Path2D();
// //         path.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
// //         setStrokes([...strokes, { path, color }]); // Store the new stroke
// //         setIsDrawing(true);
// //       }
// //     }
// //   };

// //   const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
// //     if (!isDrawing) return;

// //     const canvas = canvasRef.current;
// //     if (canvas) {
// //       const ctx = canvas.getContext("2d");
// //       if (ctx) {
// //         const lastStroke = strokes[strokes.length - 1];
// //         if (lastStroke) {
// //           lastStroke.path.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
// //           ctx.strokeStyle = lastStroke.color;
// //           ctx.stroke(lastStroke.path);
// //         }
// //       }
// //     }
// //   };

// //   const stopDrawing = () => {
// //     setIsDrawing(false);
// //   };

// //   return (
// //     <>
// //       <div className="absolute w-full z-10 flex justify-center">
// //         <div
// //           className="flex flex-col sm:flex-row gap-2 p-4 bg-white bg-opacity-80"
// //           style={{ top: 10 }}
// //         >
// //           <Button
// //             onClick={() => setReset(true)}
// //             className="bg-black text-white"
// //           >
// //             Reset
// //           </Button>
// //           <Button onClick={undoLastStroke} className="bg-black text-white">
// //             Undo
// //           </Button>

// //           <Group className="flex flex-wrap justify-center sm:justify-start">
// //             {SWATCHES.map((swatch) => (
// //               <ColorSwatch
// //                 key={swatch}
// //                 color={swatch}
// //                 onClick={() => setColor(swatch)}
// //               />
// //             ))}
// //           </Group>

// //           <Button onClick={sendData} className="bg-black text-white">
// //             Calculate
// //           </Button>
// //         </div>
// //       </div>

// //       <canvas
// //         ref={canvasRef}
// //         id="canvas"
// //         className="absolute top-0 left-0 w-full h-full bg-black"
// //         onMouseDown={startDrawing}
// //         onMouseMove={draw}
// //         onMouseUp={stopDrawing}
// //         onMouseOut={stopDrawing}
// //       />

// //       {latexExpression &&
// //         latexExpression.map((latex, index) => (
// //           <Draggable
// //             key={index}
// //             defaultPosition={latexPosition}
// //             onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
// //           >
// //             <div className="absolute p-2 text-white rounded shadow-md">
// //               <div className="latex-content">{latex}</div>
// //             </div>
// //           </Draggable>
// //         ))}
// //     </>
// //   );
// // }

import{j as a}from"./jsx-runtime-DoEZbXM1.js";import{c as C,e as O,a as f,g as j,f as I}from"./defaultTheme-p7chgXuo.js";import{r as c}from"./index-DyFhm7NF.js";import{o as W}from"./index-Bf2qc8Rt.js";import{u as M}from"./LoadingContext-BtWGSAhI.js";import{T as S}from"./Tooltip-DvI5SBDW.js";import{u as X}from"./useThemeProps-Bd4KMueQ.js";import{u as q}from"./useTheme-3fQBR54N.js";import{T as h}from"./Typography-CgOnAQvQ.js";import{k as u}from"./DefaultPropsProvider-egKEaGQO.js";const A=r=>j("MuiLoadingTypography",r),g={root:["root"]};I("MuiLoadingTypography",Object.keys(g));const E=u`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`,H=u`
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
`,N=c.forwardRef(function(y,x){const T=X({props:y,name:"MuiLoadingTypography"}),{className:n,children:o,animation:w="pulse",enableLoadingState:s=!0,showTooltipOnOverflow:b=!0,sx:i,...p}=T,v=C(g,A,(()=>{if(n)return{root:n}})()),{palette:l}=q(),{loading:t,errorMessage:d}=M(),[L,k]=c.useState(!1),m=a.jsx(h,{ref:W([x,e=>{e&&k(e.offsetWidth<e.scrollWidth||e.offsetHeight<e.scrollHeight)}]),component:"div",...p,className:O(v.root),sx:{...i,...(()=>{if(s&&(t||d))return{borderRadius:"4px","&,*":{color:"transparent !important"},...(()=>{switch(w){case"pulse":return{display:"inline",bgcolor:f(l.text.disabled,.05),...(()=>{if(t)return{animation:`1.5s ease-in-out 0.5s infinite normal none running ${E}`}})()};case"wave":return{position:"relative",overflow:"hidden","&:after":{content:'""',position:"absolute",transform:"translateX(-100%)",inset:0,background:`linear-gradient(90deg, transparent, ${f(l.text.disabled,.08)}, transparent)`,...(()=>{if(t)return{animation:`1.6s linear 0.5s infinite normal none running ${H}`}})()},WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}})()}})()},children:s&&(t||d)?a.jsx(h,{...p,component:"span",variant:"inherit",sx:{fontSize:"0.75em",...i},children:o}):o});return b&&L?a.jsx(S,{title:o,PopperProps:{sx:{"a,a:hover":{textDecoration:"none",color:"inherit !important"}}},disableInteractive:!0,children:m}):m});N.__docgenInfo={description:`A wrapper for the \`Typography\` component that adds a loading state.
It can be used to display a skeleton preview of the text while the text is loading.
It can also be used to display an error message when the text fails to load.
It can also be used to display a tooltip when the text overflows.`,methods:[],displayName:"LoadingTypography",props:{enableLoadingState:{required:!1,tsType:{name:"boolean"},description:"Whether to enable the loading state. If `true`, the loading state will be enabled.\n\n@default true"},component:{required:!1,tsType:{name:"string"},description:"The html component tag used for the root node."},showTooltipOnOverflow:{required:!1,tsType:{name:"boolean"},description:`Whether to show the tooltip when the text overflows.

@default true`}}};export{N as L};

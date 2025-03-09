import{j as h}from"./jsx-runtime-DoEZbXM1.js";import{u as E}from"./useTheme-3fQBR54N.js";import{g as m,f,e as g,c as k,a as y}from"./defaultTheme-p7chgXuo.js";import{r as v}from"./index-DyFhm7NF.js";import{u as M}from"./useThemeProps-Bd4KMueQ.js";import{u as $,s as U,m as j,a as b,k as C}from"./DefaultPropsProvider-egKEaGQO.js";function A(t){return String(t).match(/[\d.\-+]*\s*(.*)/)[1]||""}function N(t){return parseFloat(t)}function T(t){return m("MuiSkeleton",t)}f("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);const X=t=>{const{classes:o,variant:e,animation:s,hasChildren:a,width:n,height:r}=t;return k({root:["root",e,s,a&&"withChildren",a&&!n&&"fitContent",a&&!r&&"heightAuto"]},T,o)},p=C`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,c=C`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`,P=typeof p!="string"?b`
        animation: ${p} 2s ease-in-out 0.5s infinite;
      `:null,B=typeof c!="string"?b`
        &::after {
          animation: ${c} 2s linear 0.5s infinite;
        }
      `:null,I=U("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(t,o)=>{const{ownerState:e}=t;return[o.root,o[e.variant],e.animation!==!1&&o[e.animation],e.hasChildren&&o.withChildren,e.hasChildren&&!e.width&&o.fitContent,e.hasChildren&&!e.height&&o.heightAuto]}})(j(({theme:t})=>{const o=A(t.shape.borderRadius)||"px",e=N(t.shape.borderRadius);return{display:"block",backgroundColor:t.vars?t.vars.palette.Skeleton.bg:y(t.palette.text.primary,t.palette.mode==="light"?.11:.13),height:"1.2em",variants:[{props:{variant:"text"},style:{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${e}${o}/${Math.round(e/.6*10)/10}${o}`,"&:empty:before":{content:'"\\00a0"'}}},{props:{variant:"circular"},style:{borderRadius:"50%"}},{props:{variant:"rounded"},style:{borderRadius:(t.vars||t).shape.borderRadius}},{props:({ownerState:s})=>s.hasChildren,style:{"& > *":{visibility:"hidden"}}},{props:({ownerState:s})=>s.hasChildren&&!s.width,style:{maxWidth:"fit-content"}},{props:({ownerState:s})=>s.hasChildren&&!s.height,style:{height:"auto"}},{props:{animation:"pulse"},style:P||{animation:`${p} 2s ease-in-out 0.5s infinite`}},{props:{animation:"wave"},style:{position:"relative",overflow:"hidden",WebkitMaskImage:"-webkit-radial-gradient(white, black)","&::after":{background:`linear-gradient(
                90deg,
                transparent,
                ${(t.vars||t).palette.action.hover},
                transparent
              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,right:0,top:0}}},{props:{animation:"wave"},style:B||{"&::after":{animation:`${c} 2s linear 0.5s infinite`}}}]}})),K=v.forwardRef(function(o,e){const s=$({props:o,name:"MuiSkeleton"}),{animation:a="pulse",className:n,component:r="span",height:i,style:l,variant:w="text",width:x,...u}=s,d={...s,animation:a,component:r,variant:w,hasChildren:!!u.children},R=X(d);return h.jsx(I,{as:r,ref:e,className:g(R.root,n),ownerState:d,...u,style:{width:x,height:i,...l}})}),O=t=>m("MuiErrorSkeleton",t),S={root:["root"]};f("MuiErrorSkeleton",Object.keys(S));const W=v.forwardRef(function(o,e){const s=M({props:o,name:"MuiErrorSkeleton"}),{className:a,sx:n,...r}=s,i=k(S,O,(()=>{if(a)return{root:a}})()),{palette:l}=E();return h.jsx(K,{ref:e,...r,className:g(i.root),sx:{bgcolor:y(l.text.disabled,.05),...n},...r,animation:!1})});W.__docgenInfo={description:"",methods:[],displayName:"ErrorSkeleton",composes:["SkeletonProps"]};export{W as E,K as S};

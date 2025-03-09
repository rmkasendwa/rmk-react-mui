import{j as d}from"./jsx-runtime-DoEZbXM1.js";import{I as f}from"./ImageSelector-BJsRlBSh.js";import{C as Y}from"./Container-DGDyhXWn.js";import"./jsx-runtime-Bw5QeaCk.js";import"./createSvgIcon-7wHsQNqo.js";import"./index-DyFhm7NF.js";import"./SvgIcon-BsgOx8W1.js";import"./defaultTheme-p7chgXuo.js";import"./DefaultPropsProvider-egKEaGQO.js";import"./Close-BjwsHb0e.js";import"./useTheme-3fQBR54N.js";import"./page-COqIGEqn.js";import"./index-QOX7K4AL.js";import"./_commonjs-dynamic-modules-TDtrdbi3.js";import"./___vite-browser-external_commonjs-proxy-Ctkxpam9.js";import"./index-Bf2qc8Rt.js";import"./useThemeProps-Bd4KMueQ.js";import"./Modal-CXhXU4--.js";import"./utils-DsEKjbah.js";import"./TransitionGroupContext-DDx4AGHL.js";import"./index-Dri-WRqF.js";import"./index-Z2fzZyFz.js";import"./useForkRef-CH5D7H94.js";import"./createChainedFunction-BO_9K8Jh.js";import"./useSlot-By0F5cUN.js";import"./Portal-CG3BG1Jq.js";import"./Card-DZM0fdGV.js";import"./Paper-DGLpRXPs.js";import"./IconButton-A2NwtEd5.js";import"./createSimplePaletteValueFilter-bm0fmN_7.js";import"./ButtonBase-DE0LPmTn.js";import"./CircularProgress-D8lStaeO.js";import"./FormHelperText-Bu3IRHZZ.js";import"./isMuiElement-CXq9i0-O.js";import"./Grid-DBMPafDk.js";import"./extendSxProp-DAcN17IG.js";import"./Avatar-Cmpc5D-G.js";import"./Box-Cv6nAA57.js";import"./Button-UL46O9fT.js";import"./Typography-CgOnAQvQ.js";import"./index-DwZPt9kI.js";import"./styled-DnokggUK.js";const Ir={title:"Components/Image Selector",component:f},s=({...i})=>d.jsx(Y,{maxWidth:"md",sx:{p:3},children:d.jsx(f,{...i})}),v=(i,{onComplete:m,onProgress:p,onSuccess:c})=>{let r=1e4;const a=setInterval(()=>{r-=100,p((1e4-r)/1e4*100),r<=0&&(clearInterval(a),c({}),m())},100);return{cancel:()=>{clearInterval(a),console.log("Cancelled Image Upload")}}},R=(i,{onComplete:m,onError:p,onProgress:c})=>{let r=1e4;const a=Math.floor(Math.random()*1e4),l=setInterval(()=>{r-=100,c((1e4-r)/1e4*100),r<=a&&(clearInterval(l),p(new Error("Failed to upload")),m())},100);return{cancel:()=>{clearInterval(l),console.log("Cancelled Image Upload With Errors")}}},n=s.bind({}),o=s.bind({});o.args={error:!0,helperText:"This is an error message"};const e=s.bind({});e.args={upload:v};const t=s.bind({});t.args={upload:R};var E,u,g;n.parameters={...n.parameters,docs:{...(E=n.parameters)==null?void 0:E.docs,source:{originalSource:`({
  ...rest
}) => <Container maxWidth="md" sx={{
  p: 3
}}>
    <ImageSelector {...rest} />
  </Container>`,...(g=(u=n.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var S,x,h;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`({
  ...rest
}) => <Container maxWidth="md" sx={{
  p: 3
}}>
    <ImageSelector {...rest} />
  </Container>`,...(h=(x=o.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var I,A,C;e.parameters={...e.parameters,docs:{...(I=e.parameters)==null?void 0:I.docs,source:{originalSource:`({
  ...rest
}) => <Container maxWidth="md" sx={{
  p: 3
}}>
    <ImageSelector {...rest} />
  </Container>`,...(C=(A=e.parameters)==null?void 0:A.docs)==null?void 0:C.source}}};var D,P,W;t.parameters={...t.parameters,docs:{...(D=t.parameters)==null?void 0:D.docs,source:{originalSource:`({
  ...rest
}) => <Container maxWidth="md" sx={{
  p: 3
}}>
    <ImageSelector {...rest} />
  </Container>`,...(W=(P=t.parameters)==null?void 0:P.docs)==null?void 0:W.source}}};const Ar=["Default","WithFieldErrorMessage","AutoUpload","AutoUploadWithErrors"];export{e as AutoUpload,t as AutoUploadWithErrors,n as Default,o as WithFieldErrorMessage,Ar as __namedExportsOrder,Ir as default};

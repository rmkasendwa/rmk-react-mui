import{j as e}from"./jsx-runtime-DoEZbXM1.js";import{u as j,F as P,a as v}from"./Formik-NGUO7WBb.js";import{c as b,e as T,g as G,f as A}from"./defaultTheme-p7chgXuo.js";import{r as V}from"./index-DyFhm7NF.js";import{I as _}from"./ImageSelector-BJsRlBSh.js";import{u as B}from"./useThemeProps-Bd4KMueQ.js";import{C as w}from"./Container-DGDyhXWn.js";import{G as i}from"./Grid-DBMPafDk.js";import{B as E}from"./Button-UL46O9fT.js";import"./jsx-runtime-Bw5QeaCk.js";import"./DefaultPropsProvider-egKEaGQO.js";import"./_baseGet-KAaNSt7w.js";import"./createSvgIcon-7wHsQNqo.js";import"./SvgIcon-BsgOx8W1.js";import"./Close-BjwsHb0e.js";import"./useTheme-3fQBR54N.js";import"./page-COqIGEqn.js";import"./index-QOX7K4AL.js";import"./_commonjs-dynamic-modules-TDtrdbi3.js";import"./___vite-browser-external_commonjs-proxy-Ctkxpam9.js";import"./index-Bf2qc8Rt.js";import"./Modal-CXhXU4--.js";import"./utils-DsEKjbah.js";import"./TransitionGroupContext-DDx4AGHL.js";import"./index-Dri-WRqF.js";import"./index-Z2fzZyFz.js";import"./useForkRef-CH5D7H94.js";import"./createChainedFunction-BO_9K8Jh.js";import"./useSlot-By0F5cUN.js";import"./Portal-CG3BG1Jq.js";import"./Card-DZM0fdGV.js";import"./Paper-DGLpRXPs.js";import"./IconButton-A2NwtEd5.js";import"./createSimplePaletteValueFilter-bm0fmN_7.js";import"./ButtonBase-DE0LPmTn.js";import"./CircularProgress-D8lStaeO.js";import"./FormHelperText-Bu3IRHZZ.js";import"./isMuiElement-CXq9i0-O.js";import"./Avatar-Cmpc5D-G.js";import"./Box-Cv6nAA57.js";import"./extendSxProp-DAcN17IG.js";import"./Typography-CgOnAQvQ.js";import"./index-DwZPt9kI.js";import"./styled-DnokggUK.js";const M=r=>G("MuiFormikImageSelector",r),c={root:["root"]};A("MuiFormikImageSelector",Object.keys(c));const n=V.forwardRef(function(t,u){const d=B({props:t,name:"MuiFormikImageSelector"}),{className:s,name:m,value:g,onChange:x,error:f,helperText:F,...y}=d,h=b(c,M,(()=>{if(s)return{root:s}})()),{value:C,onChange:k,error:S,helperText:I}=j({value:g,name:m,error:f,helperText:F,onChange:x});return e.jsx(_,{ref:u,...y,className:T(h.root),name:m,value:C,onChange:k,error:S,helperText:I})});n.__docgenInfo={description:"",methods:[],displayName:"FormikImageSelector",props:{value:{required:!1,tsType:{name:"Array",elements:[{name:"FileContainer"}],raw:"FileContainer[]"},description:""},upload:{required:!1,tsType:{name:"signature",type:"function",raw:`(
  file: File,
  options: AsyncProcess
) => AsyncProcessController`,signature:{arguments:[{type:{name:"File"},name:"file"},{type:{name:"AsyncProcess"},name:"options"}],return:{name:"AsyncProcessController"}}},description:""}},composes:["Pick"]};const Ge={title:"Components/Formik Input Fields/Formik Image Selector",component:n},N={field:null},U=r=>e.jsx(w,{maxWidth:"md",sx:{p:3},children:e.jsx(P,{initialValues:N,onSubmit:async t=>{console.log({values:t})},children:()=>e.jsxs(v,{noValidate:!0,children:[e.jsx(n,{name:"field",...r}),e.jsxs(i,{container:!0,sx:{mt:2},children:[e.jsx(i,{item:!0,xs:!0}),e.jsx(i,{item:!0,children:e.jsx(E,{variant:"contained",type:"submit",children:"Submit"})})]})]})})}),o=U.bind({});var a,p,l;o.parameters={...o.parameters,docs:{...(a=o.parameters)==null?void 0:a.docs,source:{originalSource:`props => {
  return <Container maxWidth="md" sx={{
    p: 3
  }}>
      <Formik initialValues={initialValues} onSubmit={async values => {
      console.log({
        values
      });
    }}>
        {() => {
        return <Form noValidate>
              <FormikImageSelector name="field" {...props} />
              <Grid container sx={{
            mt: 2
          }}>
                <Grid item xs />
                <Grid item>
                  <Button variant="contained" type="submit">
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </Form>;
      }}
      </Formik>
    </Container>;
}`,...(l=(p=o.parameters)==null?void 0:p.docs)==null?void 0:l.source}}};const Ae=["Default"];export{o as Default,Ae as __namedExportsOrder,Ge as default};

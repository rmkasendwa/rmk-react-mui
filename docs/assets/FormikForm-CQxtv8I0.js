import{j as c}from"./jsx-runtime-DoEZbXM1.js";import{d as v}from"./data-qU85DSPb.js";import{f as w,c as V,e as g,g as C}from"./defaultTheme-p7chgXuo.js";import{b as q,F as j,i as I,a as M}from"./Formik-Xq4A1QCi.js";import{r as e}from"./index-DyFhm7NF.js";import{o as S}from"./index-Bf2qc8Rt.js";import{e as O}from"./index-vspTgJEr.js";import{u as H}from"./useThemeProps-Bd4KMueQ.js";import{B as x}from"./Box-Cv6nAA57.js";import{k as W}from"./DefaultPropsProvider-egKEaGQO.js";const B=o=>C("MuiFormikErrorFieldHighlighter",o),R={root:["root"],flicker:["flicker"]},rr=w("MuiFormikErrorFieldHighlighter",Object.keys(R)),U=W`
  0% {
    opacity: 0;
  }
  10%,
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`,T=e.forwardRef(function(k,E){const p=H({props:k,name:"MuiFormikErrorFieldHighlighter"}),{className:u,children:i,ScrollIntoViewProps:d={},sx:y,...l}=p,r=V(R,B,(()=>{if(u)return{root:u}})()),m=e.useRef(null),F=e.useRef(d);F.current=d;const{isValid:s,submitCount:t}=q(),n=e.useCallback(()=>{if(!s&&m.current){const a=m.current.querySelectorAll(".Mui-error");a.length>0&&(O(a[0],{scrollMode:"if-needed",behavior:"smooth",block:"center",inline:"center",...F.current}),a.forEach(h=>{h.classList.add(r.flicker),setTimeout(()=>h.classList.remove(r.flicker),1e3)}))}},[r.flicker,s]),f=e.useRef(n);return f.current=n,e.useEffect(()=>{t>0&&!s&&f.current()},[s,t]),c.jsx(x,{ref:S([E,m]),...l,className:g(r.root),sx:{...y,[`.${r.flicker}`]:{animation:`0.1s linear 0s infinite normal none running ${U}`}},children:typeof i=="function"?i({scrollToErrorFields:n}):i})});T.__docgenInfo={description:"",methods:[],displayName:"FormikErrorFieldHighlighter",props:{children:{required:!0,tsType:{name:"union",raw:"FormikErrorFieldHighlighterFunctionChildren | ReactNode",elements:[{name:"signature",type:"function",raw:`(
  props: FormikErrorFieldHighlighterFunctionChildrenProps
) => ReactNode`,signature:{arguments:[{type:{name:"signature",type:"object",raw:`{
  scrollToErrorFields: () => void;
}`,signature:{properties:[{key:"scrollToErrorFields",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}}]}},name:"props"}],return:{name:"ReactNode"}}},{name:"ReactNode"}]},description:""},ScrollIntoViewProps:{required:!1,tsType:{name:"Partial",elements:[{name:"StandardBehaviorOptions"}],raw:"Partial<StandardBehaviorOptions>"},description:""}},composes:["Partial"]};const _=o=>C("MuiFormikForm",o),b={root:["root"],formFieldsWrapper:["formFieldsWrapper"]},er=w("MuiFormikForm",Object.keys(b)),$=(o,k)=>{const E=H({props:o,name:"MuiFormikForm"}),{className:p,validationSchema:u,initialValues:i,onSubmit:d,enableReinitialize:y,children:l,FormikProps:r={},wrapChildrenInForm:m=!0,FormikErrorFieldHighlighterProps:F={},...s}=E,t=V(b,_,(()=>{if(p)return{root:p}})());return c.jsx(j,{validationSchema:u,initialValues:i,onSubmit:d,enableReinitialize:y,...r,children:({values:n,...f})=>{const a=v.diff(n,i),h=!I(a),P=c.jsx(T,{ref:k,...s,...F,className:g(t.root),children:({...N})=>typeof l=="function"?l({values:n,formHasChanges:h,changedValues:a,...N,...f}):l});return m?c.jsx(M,{className:g(t.formFieldsWrapper),noValidate:!0,children:P}):c.jsx(x,{className:g(t.formFieldsWrapper),children:P})}})},A=e.forwardRef($);A.__docgenInfo={description:"",methods:[],displayName:"FormikForm",props:{initialValues:{required:!0,tsType:{name:"Values"},description:"The initial values of the form."},children:{required:!0,tsType:{name:"union",raw:"FormikFormFunctionChildren<Values, ExtraProps> | ReactNode",elements:[{name:"signature",type:"function",raw:`(
  props: FormikProps<Values> &
    FormikErrorFieldHighlighterFunctionChildrenProps & {
      formHasChanges?: boolean;
      changedValues?: Partial<Values>;
    } & ExtraProps
) => ReactNode`,signature:{arguments:[{type:{name:"intersection",raw:`FormikProps<Values> &
FormikErrorFieldHighlighterFunctionChildrenProps & {
  formHasChanges?: boolean;
  changedValues?: Partial<Values>;
} & ExtraProps`,elements:[{name:"FormikProps",elements:[{name:"Values"}],raw:"FormikProps<Values>"},{name:"signature",type:"object",raw:`{
  scrollToErrorFields: () => void;
}`,signature:{properties:[{key:"scrollToErrorFields",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}}]}},{name:"signature",type:"object",raw:`{
  formHasChanges?: boolean;
  changedValues?: Partial<Values>;
}`,signature:{properties:[{key:"formHasChanges",value:{name:"boolean",required:!1}},{key:"changedValues",value:{name:"Partial",elements:[{name:"Values"}],raw:"Partial<Values>",required:!1}}]}},{name:"ExtraProps"}]},name:"props"}],return:{name:"ReactNode"}}},{name:"ReactNode"}]},description:"The children to render."},FormikProps:{required:!1,tsType:{name:"Partial",elements:[{name:"FormikConfig",elements:[{name:"Values"}],raw:"FormikConfig<Values>"}],raw:"Partial<FormikConfig<Values>>"},description:"The props to pass to the Formik component."},wrapChildrenInForm:{required:!1,tsType:{name:"boolean"},description:"If true, the children will be wrapped in a `<Form>` component."},FormikErrorFieldHighlighterProps:{required:!1,tsType:{name:"Partial",elements:[{name:"Omit",elements:[{name:"FormikErrorFieldHighlighterProps"},{name:"literal",value:"'ref'"}],raw:"Omit<FormikErrorFieldHighlighterProps, 'ref'>"}],raw:`Partial<
  Omit<FormikErrorFieldHighlighterProps, 'ref'>
>`},description:"The props to pass to the `<FormikErrorFieldHighlighter>` component."}},composes:["Partial","Required","Pick"]};export{A as F,rr as a,er as f};

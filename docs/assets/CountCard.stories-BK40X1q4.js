import{j as a}from"./jsx-runtime-DoEZbXM1.js";import{n as ae}from"./SearchSyncToolbar-BnnCoHC4.js";import{c as ie,e as se,a as le,g as pe,f as me}from"./defaultTheme-p7chgXuo.js";import{o as ue}from"./omit-DFcfYKFM.js";import{r as m}from"./index-DyFhm7NF.js";import{o as de}from"./index-Bf2qc8Rt.js";import"./APIContext-CE3_laQ6.js";import{u as ce}from"./CacheableData-vc3DpkOG.js";import{C as he}from"./Card-CLJ9y6I5.js";import{L as x}from"./LoadingTypography-D6ofm9jy.js";import{u as fe}from"./useThemeProps-Bd4KMueQ.js";import{u as ge}from"./useTheme-3fQBR54N.js";import{L as be}from"./Link-hwVpKlsM.js";import{L as we}from"./chunk-K6CSEXPM-C6U5PsfB.js";import"./jsx-runtime-Bw5QeaCk.js";import"./createSvgIcon-7wHsQNqo.js";import"./SvgIcon-BsgOx8W1.js";import"./DefaultPropsProvider-egKEaGQO.js";import"./Button-UL46O9fT.js";import"./createSimplePaletteValueFilter-bm0fmN_7.js";import"./TransitionGroupContext-DDx4AGHL.js";import"./ButtonBase-DE0LPmTn.js";import"./useForkRef-CH5D7H94.js";import"./CircularProgress-D8lStaeO.js";import"./_baseGet-DhYokzhK.js";import"./ReloadIconButton-B48KoK_S.js";import"./Refresh-CRz1rqFY.js";import"./ErrorAlert-McfmoKYJ.js";import"./Tooltip-DvI5SBDW.js";import"./Grow-CmgiTL0Y.js";import"./utils-DsEKjbah.js";import"./index-Dri-WRqF.js";import"./index-Z2fzZyFz.js";import"./useSlot-By0F5cUN.js";import"./Portal-CG3BG1Jq.js";import"./styled-DnokggUK.js";import"./extendSxProp-DAcN17IG.js";import"./Typography-CgOnAQvQ.js";import"./index-DwZPt9kI.js";import"./IconButton-A2NwtEd5.js";import"./Box-Cv6nAA57.js";import"./Alert-B-kYoUC8.js";import"./Paper-DGLpRXPs.js";import"./Grid-DBMPafDk.js";import"./constants-DkQff0yi.js";import"./InfiniteScrollBox-lWcthrSh.js";import"./Close-BjwsHb0e.js";import"./LoadingContext-BtWGSAhI.js";import"./ErrorSkeleton-BVzoEatx.js";import"./FieldLabel-DdtaNqXB.js";import"./Formik-Xq4A1QCi.js";import"./dates-CvympFuk.js";import"./endOfMonth-DQe_4K7C.js";import"./GlobalConfigurationContext-CqlJy_iX.js";import"./DatePicker-DnCj008b.js";import"./ClickAwayListener-C4Bzfge9.js";import"./List-BTl9Ld56.js";import"./Card-DZM0fdGV.js";import"./Modal-CXhXU4--.js";import"./createChainedFunction-BO_9K8Jh.js";import"./String-3Y7uMP2t.js";import"./_commonjs-dynamic-modules-TDtrdbi3.js";import"./FormHelperText-Bu3IRHZZ.js";import"./isMuiElement-CXq9i0-O.js";function ye(e){return pe("MuiCountCard",e)}me("MuiCountCard",["root"]);const Ce={root:["root"]},b=m.forwardRef(function(I,V){const w=fe({props:I,name:"MuiCountCard"}),{countFinder:z,title:c,className:y,CardBodyProps:_={},CountProps:B={},LabelProps:A={},pathToViewCountedRecords:C,revalidationKey:N,loadOnMount:U,sx:H,...$}=ue(w,"labelPlural","labelSingular");let{labelPlural:t,labelSingular:h}=w;const G=ie(Ce,ye,(()=>{if(y)return{root:y}})()),{sx:K,...J}=_,{sx:Q,...P}=B,{sx:X,...Y}=A,{palette:Z}=ge(),f=m.useRef(null),[r,v]=m.useState(0),T=r<=350;m.useEffect(()=>{if(f.current){const o=f.current,n=new ResizeObserver(()=>{const{offsetHeight:re,offsetWidth:ne}=o;v(Math.min(re,ne))});return n.observe(o),()=>{n.unobserve(o)}}else v(0)},[]),t||(typeof c=="string"?t=c:t="Records"),!h&&t&&(h=t.replace(/s$/,""));const{data:g,load:ee,loading:te,errorMessage:oe}=ce(z,{revalidationKey:N,loadOnMount:U});return a.jsxs(he,{ref:de([f,V]),...$,title:c,load:ee,loading:te,errorMessage:oe,className:se(G.root),sx:{...H,display:"flex",flexDirection:"column"},CardBodyProps:{...J,sx:{...K,flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",position:"relative"}},children:[(()=>{const o={...Q,fontWeight:400,lineHeight:1,width:"100%",...T&&r>0?{fontSize:Math.floor(r/2.5)}:{fontSize:144}},n=g!=null?ae.addThousandCommas(g):"--";return C?a.jsx(be,{color:"primary",...P,component:we,to:C,underline:"none",noWrap:!0,align:"center",sx:{...o,display:"block"},children:n}):a.jsx(x,{color:"primary",...P,noWrap:!0,align:"center",sx:o,children:n})})(),a.jsx(x,{...Y,noWrap:!0,align:"center",sx:{color:le(Z.text.secondary,.38),width:"100%",...X,...T&&r>0?{fontSize:Math.floor(r/8.75)}:{fontSize:40}},children:g===1?h:t})]})});b.__docgenInfo={description:"",methods:[],displayName:"CountCard",props:{countFinder:{required:!0,tsType:{name:"signature",type:"function",raw:"(options: CacheableDataFinderOptions) => Promise<number>",signature:{arguments:[{type:{name:"signature",type:"object",raw:`{
  /**
   * Function that can be used to retrieve the request controller of the data request.
   *
   * @param controller The request controller that can be used to cancel the request.
   */
  getRequestController: (controller: RecordFinderRequestController) => void;

  /**
   * Function that can be used to retrieve stale data while the request is being made.
   */
  getStaleWhileRevalidate: GetStaleWhileRevalidateFunction<any>;
}`,signature:{properties:[{key:"getRequestController",value:{name:"signature",type:"function",raw:"(controller: RecordFinderRequestController) => void",signature:{arguments:[{type:{name:"RecordFinderRequestController"},name:"controller"}],return:{name:"void"}},required:!0},description:`Function that can be used to retrieve the request controller of the data request.

@param controller The request controller that can be used to cancel the request.`},{key:"getStaleWhileRevalidate",value:{name:"signature",type:"function",raw:"(data: Data) => void",signature:{arguments:[{type:{name:"any"},name:"data"}],return:{name:"void"}},required:!0},description:"Function that can be used to retrieve stale data while the request is being made."}]}},name:"options"}],return:{name:"Promise",elements:[{name:"number"}],raw:"Promise<number>"}}},description:""},labelPlural:{required:!1,tsType:{name:"string"},description:""},labelSingular:{required:!1,tsType:{name:"string"},description:""},CountProps:{required:!1,tsType:{name:"Partial",elements:[{name:"intersection",raw:`Omit<TypographyProps, 'ref'> &
Pick<SkeletonProps, 'animation'> & {
  /**
   * Whether to enable the loading state. If \`true\`, the loading state will be enabled.
   *
   * @default true
   */
  enableLoadingState?: boolean;

  /**
   * The html component tag used for the root node.
   */
  component?: string;

  /**
   * Whether to show the tooltip when the text overflows.
   *
   * @default true
   */
  showTooltipOnOverflow?: boolean;
}`,elements:[{name:"Omit",elements:[{name:"TypographyProps"},{name:"literal",value:"'ref'"}],raw:"Omit<TypographyProps, 'ref'>"},{name:"Pick",elements:[{name:"SkeletonProps"},{name:"literal",value:"'animation'"}],raw:"Pick<SkeletonProps, 'animation'>"},{name:"signature",type:"object",raw:`{
  /**
   * Whether to enable the loading state. If \`true\`, the loading state will be enabled.
   *
   * @default true
   */
  enableLoadingState?: boolean;

  /**
   * The html component tag used for the root node.
   */
  component?: string;

  /**
   * Whether to show the tooltip when the text overflows.
   *
   * @default true
   */
  showTooltipOnOverflow?: boolean;
}`,signature:{properties:[{key:"enableLoadingState",value:{name:"boolean",required:!1},description:"Whether to enable the loading state. If `true`, the loading state will be enabled.\n\n@default true"},{key:"component",value:{name:"string",required:!1},description:"The html component tag used for the root node."},{key:"showTooltipOnOverflow",value:{name:"boolean",required:!1},description:`Whether to show the tooltip when the text overflows.

@default true`}]}}]}],raw:"Partial<LoadingTypographyProps>"},description:""},LabelProps:{required:!1,tsType:{name:"Partial",elements:[{name:"intersection",raw:`Omit<TypographyProps, 'ref'> &
Pick<SkeletonProps, 'animation'> & {
  /**
   * Whether to enable the loading state. If \`true\`, the loading state will be enabled.
   *
   * @default true
   */
  enableLoadingState?: boolean;

  /**
   * The html component tag used for the root node.
   */
  component?: string;

  /**
   * Whether to show the tooltip when the text overflows.
   *
   * @default true
   */
  showTooltipOnOverflow?: boolean;
}`,elements:[{name:"Omit",elements:[{name:"TypographyProps"},{name:"literal",value:"'ref'"}],raw:"Omit<TypographyProps, 'ref'>"},{name:"Pick",elements:[{name:"SkeletonProps"},{name:"literal",value:"'animation'"}],raw:"Pick<SkeletonProps, 'animation'>"},{name:"signature",type:"object",raw:`{
  /**
   * Whether to enable the loading state. If \`true\`, the loading state will be enabled.
   *
   * @default true
   */
  enableLoadingState?: boolean;

  /**
   * The html component tag used for the root node.
   */
  component?: string;

  /**
   * Whether to show the tooltip when the text overflows.
   *
   * @default true
   */
  showTooltipOnOverflow?: boolean;
}`,signature:{properties:[{key:"enableLoadingState",value:{name:"boolean",required:!1},description:"Whether to enable the loading state. If `true`, the loading state will be enabled.\n\n@default true"},{key:"component",value:{name:"string",required:!1},description:"The html component tag used for the root node."},{key:"showTooltipOnOverflow",value:{name:"boolean",required:!1},description:`Whether to show the tooltip when the text overflows.

@default true`}]}}]}],raw:"Partial<LoadingTypographyProps>"},description:""},pathToViewCountedRecords:{required:!1,tsType:{name:"string"},description:""}},composes:["Partial","Pick"]};const Ot={title:"Components/Count Card",component:b},u=e=>a.jsx(b,{...e}),d=()=>new Promise(e=>setTimeout(()=>e(Math.round(Math.random()*1e3)),2e3)),i=u.bind({});i.args={countFinder:d,sx:{position:"absolute",width:"100%",height:"100%"}};const s=u.bind({});s.args={title:"All Elements",labelPlural:"Elements",countFinder:d};const l=u.bind({});l.args={labelPlural:"Pneumonoultramicroscopicsilicovolcanoconioses",labelSingular:"Pneumonoultramicroscopicsilicovolcanoconiosis",countFinder:d};const p=u.bind({});p.args={countFinder:d,pathToViewCountedRecords:"/path/to/view/counted/records"};var S,q,W;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:"props => <CountCard {...props} />",...(W=(q=i.parameters)==null?void 0:q.docs)==null?void 0:W.source}}};var R,k,L;s.parameters={...s.parameters,docs:{...(R=s.parameters)==null?void 0:R.docs,source:{originalSource:"props => <CountCard {...props} />",...(L=(k=s.parameters)==null?void 0:k.docs)==null?void 0:L.source}}};var O,F,j;l.parameters={...l.parameters,docs:{...(O=l.parameters)==null?void 0:O.docs,source:{originalSource:"props => <CountCard {...props} />",...(j=(F=l.parameters)==null?void 0:F.docs)==null?void 0:j.source}}};var E,M,D;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:"props => <CountCard {...props} />",...(D=(M=p.parameters)==null?void 0:M.docs)==null?void 0:D.source}}};const Ft=["Default","WithTitle","WithAVeryLongLabel","WithPathToViewCountedRecords"];export{i as Default,l as WithAVeryLongLabel,p as WithPathToViewCountedRecords,s as WithTitle,Ft as __namedExportsOrder,Ot as default};

import{j as u}from"./jsx-runtime-DoEZbXM1.js";import{u as P}from"./useTheme-3fQBR54N.js";import{u as b}from"./dates-CvympFuk.js";import{c as g,e as y,g as w,f as x}from"./defaultTheme-p7chgXuo.js";import{r as S}from"./index-DyFhm7NF.js";import{S as A}from"./SearchSyncToolbar-BD-kT8Me.js";import{u as q}from"./useThemeProps-Bd4KMueQ.js";import{B as j}from"./Box-Cv6nAA57.js";const C=e=>w("MuiPageTitle",e),N={root:["root"]};x("MuiPageTitle",Object.keys(N));const k=S.forwardRef(function(s,i){const l=q({props:s,name:"MuiPageTitle"}),{className:t,tools:d,title:o,TitleProps:p={},...n}=l,r=g(N,C,(()=>{if(t)return{root:t}})()),{sx:c,...m}=p,{breakpoints:a}=P(),h=b(a.up("sm"));return u.jsx(A,{tools:d,title:h?o:null,hasSearchTool:!1,ref:i,...n,className:y(r.root),TitleProps:{variant:"h3",...m,sx:{fontSize:22,lineHeight:"50px",[a.down("md")]:{fontSize:18},...c}}})});k.__docgenInfo={description:"",methods:[],displayName:"PageTitle",props:{title:{required:!1,tsType:{name:"ReactNode"},description:"The title of the toolbar. It can accept a ReactNode to render custom content."},hasSearchTool:{required:!1,tsType:{name:"boolean"},description:`Determines whether the component should be rendered with a search tool.

@default true`},searchFieldPlaceholder:{required:!1,tsType:{name:"string"},description:"The placeholder text for the search field."},hasSyncTool:{required:!1,tsType:{name:"boolean"},description:`Determines whether the component should be rendered with a synchronize tool.
Note: The synchronize tool will not be rendered if the load function is not supplied regardless of whether this value is set to true.

@default true`},tools:{required:!1,tsType:{name:"Array",elements:[{name:"unknown"}],raw:"(ReactNode | Tool)[]"},description:`An array of extra tools to be added to the toolbar.
These tools can be ReactNodes or Tool objects.`},preTitleTools:{required:!1,tsType:{name:"Array",elements:[{name:"unknown"}],raw:"(ReactNode | Tool)[]"},description:`An array of extra tools to be added before the title in the toolbar.
These tools can be ReactNodes or Tool objects.`},postSyncButtonTools:{required:!1,tsType:{name:"Array",elements:[{name:"unknown"}],raw:"(ReactNode | Tool)[]"},description:`An array of extra tools to be added after the synchronize button in the toolbar.
These tools can be ReactNodes or Tool objects.`},children:{required:!1,tsType:{name:"ReactNode"},description:`Extra tools to be added to the toolbar.
Note: Tools will always overwrite children.

These tools can be ReactNodes or Tool objects.`},TitleProps:{required:!1,tsType:{name:"Partial",elements:[{name:"Omit",elements:[{name:"intersection",raw:`Omit<TypographyProps, 'ref'> &
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

@default true`}]}}]},{name:"literal",value:"'ref'"}],raw:"Omit<LoadingTypographyProps, 'ref'>"}],raw:"Partial<Omit<LoadingTypographyProps, 'ref'>>"},description:`Props for customizing the title component.
Accepts properties from LoadingTypographyProps interface with some properties omitted.`},searchFieldOpen:{required:!1,tsType:{name:"boolean"},description:"Determines whether the search field should be open or closed."},SearchFieldProps:{required:!1,tsType:{name:"Partial",elements:[{name:"SearchFieldProps"}],raw:"Partial<SearchFieldProps>"},description:`Props for customizing the search field component.
Accepts properties from SearchFieldProps interface.`},alignTools:{required:!1,tsType:{name:"union",raw:"'start' | 'end'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'end'"}]},description:`The alignment of the tools in the toolbar.

@default 'end'`},maxTitleWidth:{required:!1,tsType:{name:"number"},description:"The maximum width of the title."},maxSearchFieldWidth:{required:!1,tsType:{name:"number"},description:"The maximum width of the search field."}},composes:["Omit","Partial","Pick"]};const W=e=>w("MuiPaddedContentArea",e),v={root:["root"]};x("MuiPaddedContentArea",Object.keys(v));const z=S.forwardRef(function(s,i){const l=q({props:s,name:"MuiPaddedContentArea"}),{className:t,children:d,title:o,sx:p,tools:n,breadcrumbs:r,PageTitleProps:c={},...m}=l,a=g(v,W,(()=>{if(t)return{root:t}})()),{sx:h,...R}=c,{breakpoints:f}=P(),O=f.down("sm"),T=b(f.up("sm"));return u.jsxs(j,{...m,ref:i,className:y(a.root),sx:{flex:1,px:3,[O]:{px:0},...p},children:[r&&T?r:null,o&&T||n?u.jsx(k,{title:o,tools:n,...R,sx:{px:0,...h}}):null,d]})});z.__docgenInfo={description:"",methods:[],displayName:"PaddedContentArea",props:{breadcrumbs:{required:!1,tsType:{name:"ReactNode"},description:""},PageTitleProps:{required:!1,tsType:{name:"Partial",elements:[{name:"PageTitleProps"}],raw:"Partial<PageTitleProps>"},description:""},children:{required:!0,tsType:{name:"ReactNode"},description:""}},composes:["Pick"]};export{z as P};

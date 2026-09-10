import { elementClicked, pauseWorkflowClient, setCustomState } from "@buildprint/bubblescript";
export default elementClicked("Delayed switch", {actions:[pauseWorkflowClient({length:1000}),setCustomState({element:"wtf-260-autobinding",state:"Selected record",value:"B"})]});

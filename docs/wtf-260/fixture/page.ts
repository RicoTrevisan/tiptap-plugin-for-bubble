// @buildprint raw-locations: 1

import { dataTypeRef, plugin, button, dynamicText, element, group, page, parentThing, search, text } from "@buildprint/bubblescript";

export default page("bpmsmqwc", {
	name: "wtf-260-autobinding",
	title: "WTF-260 autobinding regression",
    customStates:[{name:"Selected record",id:"selected_record",type:"text",defaultValue:"A"},{name:"Save delay",id:"save_delay",type:"number",defaultValue:0}],
	layout: { container: "column", gap: 16, padding: 32, height: "fill", width: "fill" },
	appearance: { background: "#FFFFFF" },
	children: [
		text("bpmsmqwd", "WTF-260 — typing and record switching", { name: "Title", layout: { height: "fit", alignSelf: "stretch", width: "fill" } }),
		button("bpmsmqwe", "Record A", { name: "Record A", layout: { height: "fit", padding: 12, alignSelf: "flex-start", width: "fit" } }),
		button("bpmsmqwf", "Record B", { name: "Record B", layout: { height: "fit", padding: 12, alignSelf: "flex-start", width: "fit" } }),
		button("bpbniaqu", "Switch to B in 1 second", {name:"Delayed switch",layout:{height:"fit",width:"fit",alignSelf:"flex-start",padding:12}}),
        button("bphidenv", "Hide editor", {name:"Hide editor",layout:{height:"fit",width:"fit",alignSelf:"flex-start",padding:12}}),
        button("bpshowev", "Show editor", {name:"Show editor",layout:{height:"fit",width:"fit",alignSelf:"flex-start",padding:12}}),
        button("bpdelayz", "Delay 0", {name:"Delay 0",layout:{height:"fit",width:"fit",alignSelf:"flex-start",padding:12}}),
        button("bpdelayd", "Delay 300", {name:"Delay 300",layout:{height:"fit",width:"fit",alignSelf:"flex-start",padding:12}}),
        group("bpmsmqwg", {
			name: "Bound record",
			groupType: dataTypeRef("Doc"),
            dataSource: search("Doc", {constraints:[{field:"Title",operator:"equals",value:dynamicText("WTF-260 ",element("wtf-260-autobinding").state("Selected record"))}]}).firstItem(),
			layout: { collapseWhenHidden: false, container: "column", height: "fit", alignSelf: "flex-start", width: "fill" },
			appearance: { background: "#FFFFFF" },
			children: [
				text("bpmsmqwh", dynamicText(parentThing().field("Title")), { name: "Current record", layout: { height: "fit", width: "fit" } }),
				text("bpmsmqwj", dynamicText("Stored HTML: ", parentThing().field("HTML")), { name: "Stored HTML", layout: { height: "fit", width: "fit" } }),
				plugin("bpmsmqwi", {
					type: "1670612027178x122079323974008830_current-AAC",
					name: "Autobound editor",
					style: "Standard tiptap",
					layout: { height: "fit", minHeight: 240, width: "fill", alignSelf: "stretch" },
                    appearance: {htmlId:"wtf260-editor"},
                    properties: {autobinding_record_id:parentThing().uniqueId(), mention_list_type:dataTypeRef("Doc"), ext_mention:false, update_delay:element("wtf-260-autobinding").state("Save delay"), isEditable:true, collab_active:false},
				}),
			],
		}),
	],
});

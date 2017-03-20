/**
 * Type definitions for CSInterface.
 * @description This is minimum defnitions for avoid TS compile error.
 */

declare class CSEvent {

	constructor(type:any, scope:any, appId?:any, extensionId?:any);

	 extensionId: any;
	 data: any;
}

declare class CSInterface {

	constructor();

	getExtensionID() : any;
	evalScript(script:string, callback?:any);
	addEventListener(type:string, listener:any, obj?:Object);
	dispatchEvent(event:CSEvent);
}


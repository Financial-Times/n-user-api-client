export namespace ConsentAPI {
	export interface ConsentChannel {
		version?: number;
		status: boolean;
		lbi: boolean;
		fow: string;
		source: string;
		lastModified?: string;
	}

	export interface ConsentCategory {
		[name: string]: ConsentChannel;
	}

	export interface ConsentCategories {
		[name: string]: Array<ConsentCategory>;
	}

	export interface ConsentUnit {
		version?: number;
		lastModified?: string;
		data: ConsentChannel;
	}

	export interface ConsentRecord {
		version?: number;
		lastModified?: string;
		data: ConsentCategories;
	}
}

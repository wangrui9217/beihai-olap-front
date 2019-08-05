
const _config ={
	'development': {
		baseURL: '/olap',
		BASE_FILE_URL: 'olap'
	},
	'test': this.development,
	'production': {
		baseURL: '/olap',
		BASE_FILE_URL: 'olap'
	}
}
const baseURL = _config[process.env.NODE_ENV].baseURL

export { baseURL }
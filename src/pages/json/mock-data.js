
export const invalidFormattedJsonInput =`
// payload 请求内容 response 响应内容
let { payload, response } = arguments[0];
if (response.code === "0") {
	// response.info
}
return response;
`;




export const SampleData = {
	jsonInput: invalidFormattedJsonInput,
};

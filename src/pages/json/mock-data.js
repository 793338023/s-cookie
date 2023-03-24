
export const invalidFormattedJsonInput =`
// query url请求参数 body 请求内容
let { query, body, response, method } = arguments[0];
if (response.code === "0") {
	// response.info
}
return response;
`;




export const SampleData = {
	jsonInput: invalidFormattedJsonInput,
};

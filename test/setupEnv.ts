export default (): void => {
	console.log("\nSetup test environment");
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	return;
};
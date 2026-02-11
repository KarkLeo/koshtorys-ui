const TokensService = {
	clearTokens() {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
	}
};

export default TokensService;

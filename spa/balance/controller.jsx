var BalanceController = function (view) {
    var context = this;
    context.view = view;

    context.renderItems = async function renderItems() {
        if(!window.ethArtToken) {
            return setTimeout(()=> context.renderItems());
        }
        context.view.setState({items: null});
        var items = {};
        context.renderItemsOfToken(window.ethArtToken, items);
        context.renderItemsOfToken(window.standaloneToken, items);
    };

    context.renderItemsOfToken = async function renderItemsOfToken(token, items) {
        var tokenAddress = token.options.address;
        var ticker = await window.blockchainCall(token.methods.symbol);
        var balance = !window.walletAddress ? 0 : parseInt(await window.blockchainCall(token.methods.balanceOf, window.walletAddress));
        for(var i = 0; i < balance; i++) {
            var tokenId = await window.blockchainCall(token.methods.tokenOfOwnerByIndex, window.walletAddress, i);
            var item = items[tokenId + "_" + tokenAddress] = {
                key: tokenId + "_" + tokenAddress,
                tokenId,
                metadataLink : await window.blockchainCall(token.methods.tokenURI, tokenId),
                openSeaLink : window.context.openSeaURL + tokenAddress + '/' + tokenId,
                etherscanLink : window.getNetworkElement('etherscanURL') + 'token/' + tokenAddress + '?a=' + tokenId,
                tokenAddress,
                ticker,
                loading: true
            };
            context.view.setState({items});
            var metadata = await window.AJAXRequest(item.metadataLink.split('ipfs://').join('//gateway.ipfs.io/'));
            Object.keys(metadata).forEach(key => item[key] = metadata[key]);
            Object.keys(item).forEach(key => {
                try {
                    item[key] = item[key].split('ipfs://').join('//gateway.ipfs.io/');
                } catch(e) {
                }
            });
            delete item.loading;
            context.view.setState({items});
        }
    };
};
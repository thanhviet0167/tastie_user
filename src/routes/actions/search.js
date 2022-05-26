const { url_search, url_get_list_provider_by_ecoupon } = require("../../constant/url");
const requestControllers = require("../../controllers/requestcontrollers");




const SearchRouter = app => {
    app.post(url_search,requestControllers.SearchBar)
    app.post(url_get_list_provider_by_ecoupon, requestControllers.getListProviderByEcoupon)
}



module.exports = SearchRouter;
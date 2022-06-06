const { url_search, url_get_list_provider_by_ecoupon, url_get_list_provider_favorite } = require("../../constant/url");
const requestControllers = require("../../controllers/requestcontrollers");




const SearchRouter = app => {
    app.post(url_search,requestControllers.SearchBar)
    app.post(url_get_list_provider_by_ecoupon, requestControllers.getListProviderByEcoupon)
    app.post(url_get_list_provider_favorite, requestControllers.getListProviderFavorite)
}



module.exports = SearchRouter;
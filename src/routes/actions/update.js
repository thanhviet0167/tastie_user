const { url_update, url_get_access_token, url_change_password, url_add_to_favorite, url_remove_to_favorite } = require("../../constant/url");
const getAccessToken = require("../../controllers/acesstokencontrollers");
const requestControllers = require("../../controllers/requestcontrollers");
const UserControllers = require("../../controllers/usercontrollers");



const updateRoute = (app) => {

    app.post(url_update, UserControllers.updateAccount);
    app.post(url_get_access_token, getAccessToken);
    app.post(url_change_password, UserControllers.changePassword)

    app.post(url_add_to_favorite, requestControllers.addToFavorite)
    app.post(url_remove_to_favorite, requestControllers.removeFromFavorite)
 
}

module.exports = updateRoute;
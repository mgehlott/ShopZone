exports.get404 = (req, res, next) => {

    res.status(404).render('404',
        {
            pageTitle: 'Page not Found',
            path: '', isAuth: req.session.isLoggedIn
        });
}

exports.get500 = (req, res, next) => {

    res.status(500).render('500',
        {
            pageTitle: 'Error!!',
            path: '',
            isAuth: req.session.isLoggedIn
        });
}


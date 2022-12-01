const errorHandler = (err, req, res, next) => {
    console.error("Overrided default Express error handler...");
    console.error(err.stack);
    res.status(500).json({msg: err.message})
}

module.exports = { errorHandler }

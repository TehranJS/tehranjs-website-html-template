
// Allow for looping on nodes by chaining:
// qsa('.foo').forEach(function () {})
NodeList.prototype.forEach = Array.prototype.forEach;

module.exports = {
    // Get element(s) by CSS selector:
    qs: function(selector, scope) {
        return (scope || document).querySelector(selector);
    },
    qsa: function(selector, scope) {
        return (scope || document).querySelectorAll(selector);
    }
};

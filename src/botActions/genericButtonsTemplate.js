var genericButtonsTemplate = (userId, title, buttons ) => {

    return {
        recipient: {
            id: userId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: title,
                        buttons: buttons
                    }]
                }
            }
        }
    };
};

module.exports = genericButtonsTemplate;
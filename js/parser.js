var parserService = {};

parserService.getStatus = function (url, data, opts) {
      $.ajax({
          url: url+ "trainingstatus",
          type: "POST",
          async: false,
          data: data,
          success: opts.success,
          error: opts.error
      });
};

parserService.parse = function (url, data, opts) {
    $.ajax({
        url: url+ "parse",
        type: "POST",
        async: false,
        data: JSON.stringify({parserParam:data}),
        success: opts.success,
        error: opts.error,
        contentType: "application/json",
    });
};

parserService.train = function (url, data) {
	return $.ajax({
        url: url+ "train",
        type: "POST",
        async: false,
        data: JSON.stringify({parserParam:data}),
        contentType: "application/json",
    });
};

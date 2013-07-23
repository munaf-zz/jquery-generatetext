// jQuery-generateText
// Uses Markov Chains to generate content based on an example corpus.
// Very much under development.
// Author: Munaf Assaf (munaf.assaf@gmail.com)
// License: MIT

;(function ( $, window, document, undefined ) {

	var pluginName = "generateText",
		defaults = {
			inputFromDom: false, // String input by default
			outputToDom: true,   // Default to DOM output
			markovOrder: 2,      // Markov-Chain Order
			numOutputWords: 100, // Default # of words to output
		};

	function Plugin ( element, options ) {
		this.el  = element;

		this.settings = $.extend( {}, defaults, options );

		this._defaults = defaults;
		this._name = pluginName;

		return this.init();
	}

	Plugin.prototype = {
		init: function () {
			var outputText = '';

			this._resetPrefix();
			this._markovDict = [];
			this._markovCorpus = []
			this._formattedCorpus = '';
			this._latinBased = true;

			if ( this.settings.inputFromDom === true ) {
				this.addCorpus( $(this.settings.inputSelector).text() );
			} else {
				this.addCorpus( this.settings.inputText );
			}

			this._populateDict();
			this._addWord(' ');
			outputText = this.generateText( this.settings.numOutputWords );

			if ( this.settings.outputToDom === true ) {
				$( this.el ).text( outputText );
				return this;
			} else {
				return outputText;
			}

		},

		// @public
		// Add a corpus one at a time
		// Lets you build up a corpus from various sources before executing
		addCorpus: function ( corpusText ) {

			corpusText = corpusText.replace(/#|"/g, '').replace(/\d+:\d+/g, '');
			corpusText = corpusText.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');

			this._formattedCorpus += corpusText;
			this._setupMarkovCorpus();
		},

		// @public
		// Manually call this to regenerate text.
		// Use case: You want to generate text in more than one place.
		// Use case: You added another corpus and want to regenerate.
		generateText: function ( numWords ) { 
			var outputText = "";

			this._resetPrefix();

			for ( var i = 0; i < numWords; i++ ) {
				var words = this._markovDict[ this._markovPrefix.join('#') ];
				var word = words[ Math.floor( Math.random() * words.length ) ];

				if ( word === ' ' ) break;

				outputText += word + ( this._latinBased ? ' ' : '' );
				
				this._markovPrefix.shift();
				this._markovPrefix.push( word );
			}

			return outputText;
		},

		// @private
		// Creates the data structures needed for markov chaining.
		// Uses a very fuzzy approach to detecting foreign languages via Unicode range.
		_setupMarkovCorpus: function () {
			var numForeignChars = 0,
				corpusLength = this._formattedCorpus.length;

			this._markovCorpus = [];

			for ( var i = 0; i < corpusLength; i++ ) {
				if ( this._formattedCorpus.charCodeAt(i) > 255 ) {
					numForeignChars++;
				}
			}

			if ( numForeignChars >= corpusLength/3 ) {
				this._latinBased = false;
				this._markovCorpus = this._formattedCorpus.replace(/\s+/g, '').split('');
			} else {
				this._latinBased = true;
				this._markovCorpus = this._formattedCorpus.split(' ');
			}
		},

		// @private
		// Utility function to empty the Markov Prefix array.
		_resetPrefix: function () {
			this._markovPrefix = [];
			for ( var i = 0; i < this.markovOrder; i++ ) {
				this._markovPrefix.push(' ');
			}
		},

		// @private
		// Bootstrapping function to fill the Markov Corpus array.
		_populateDict: function () {
			for ( var i = 0; i < this._markovCorpus.length; i++ ) {
				this._addWord( this._markovCorpus[i] );
			}
		},

		// @private
		// Utility function that adds one word at a time to the Markov utility arrays.
		_addWord: function ( word ) {
			var key = this._markovPrefix.join('#');

			if ( this._markovDict[key] === null || this._markovDict[key] === undefined ) {
				this._markovDict[key] = [];
			}

			this._markovDict[key].push( word );
			this._markovPrefix.shift();
			this._markovPrefix.push( word );
		} 

	};

	// A really lightweight plugin wrapper around the constructor
	// preventing against multiple instantiations
	$.fn[ pluginName ] = function ( options ) {
		return this.each(function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
		});
	};

})( jQuery, window, document );

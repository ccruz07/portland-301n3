// STEP #1
(function(module){
  // D-E: Wrap the entire contents of this file in an IIFE.
  // Pass in to the IIFE a module, upon which objects can be attached for later access.

  function Article (opts) {
    this.author = opts.author;
    this.authorUrl = opts.authorUrl;
    this.title = opts.title;
    this.category = opts.category;
    this.body = opts.body;
    this.publishedOn = opts.publishedOn;
  }

  Article.all = [];

  Article.prototype.toHtml = function() {
    var template = Handlebars.compile($('#article-template').text());

    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
    this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
    this.body = marked(this.body);

    return template(this);
  };

  Article.loadAll = function(rawData) {
    rawData.sort(function(a,b) {
      return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
    });

    // DONE: Refactor this forEach code, by using a `.map` call instead, since what we are trying to accomplish
    // is the transformation of one colleciton into another.
    // rawData.forEach(function(ele) {
    //   Article.all.push(new Article(ele));
    // })
    Article.all = rawData.map(function(ele) {
      return new Article(ele);
    });
  };

  // This function will retrieve the data from either a local or remote source,
  // and process it, then hand off control to the View.
  
  /*
   * STEP #2
   */
  
  // D-E: Refactor this function, and provide it with a parameter of a callback function
  //(for now just a placeholder, but to be referenced at call time as a view function)
  // to execute once the loading of articles is done. We do this because we might want
  // to call other view functions, and not just this initIndexPage() that we are replacing.
  // Now, instead of calling articleView.initIndexPage(), we can simply run our callback.
  Article.fetchAll = function(callback) {
    if (localStorage.rawData) {
      Article.loadAll(JSON.parse(localStorage.rawData));
      callback();
    } else {
      $.getJSON('/data/hackerIpsum.json', function(rawData) {
        Article.loadAll(rawData);
        localStorage.rawData = JSON.stringify(rawData); // Cache the json, so we don't need to request it next time.
        callback();
      });
    }
  };

  // STEP #4
  // D-E: Chain together a `map` and a `reduce` call to get a rough count of all words in all articles.
  Article.numWordsAll = function() {
    return Article.all.map(function(article) {
      // Get the total number of words in this article
      return article.body.split(' ').length;
    })
    .reduce(function(a, b) {
      // Sum up all the values in the collection
      return a + b;
    });
  };

  // STEP #5
  // D-E: Chain together a `map` and a `reduce` call to produce an array of unique author names.
  Article.allAuthors = function() {
    return Article.all
      .map(function(article) {
        return article.author;
      })
      .reduce(function(acc, name) {
        if (acc.indexOf(name) === -1) {
          acc.push(name);
        }
        return acc;
      }, []);
  };

  // STEP #6
  Article.numWordsByAuthor = function() {
    // TODO: Transform each author string into an object with 2 properties: One for
    // the author's name, and one for the total number of words across all articles written by the specified author.
    return Article.allAuthors().map(function(author) {
      return {
        name: author,
        numWords: Article.all.filter(function(article) {
          return article.author === author;
        })
        .map(function(article) {
          return article.body.match(/\b\w+/g).length;
        })
        .reduce(function(accumulator, index) {
          return accumulator + index;
        })
      };
    });
  };

  // STEP #1 cont.
  module.Article = Article;

})(window);
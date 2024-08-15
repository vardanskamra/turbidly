$(document).ready(function() {
    // Function to load articles in CMS admin
    function loadArticles() {
        $.ajax({
            url: "/api/latest-news",
            method: "GET",
            success: function(data) {
                $("#latest-news").empty(); // Clear previous articles
                data.forEach(function(article) {
                    var articleHtml = `
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <img src="${article.image}" class="card-img-top" alt="Article Image">
                                <div class="card-body">
                                    <h5 class="card-title">${article.headline}</h5>
                                    <p class="card-text">${article.mainArticle.substring(0, 50)}...</p>
                                    <a href="/article/${article._id}" class="btn btn-primary">Read More</a>
                                </div>
                            </div>
                        </div>
                    `;
                    $("#latest-news").append(articleHtml);
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error:", textStatus, errorThrown);
                alert("Failed to load articles. Please try again later.");
            }
        });
    }

    // Load articles when the page loads
    loadArticles();

    $("#add-article-form").submit(function(event) {
        event.preventDefault();
        var formData = $(this).serialize();
        $.post("/cmsadmin/add-article", formData)
            .done(function(response) {
                $("#add-article-form")[0].reset(); // Clear form fields
                alert("Article added successfully!");
                // No need to reload articles here since it's handled after successful addition
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error("Error adding article:", textStatus, errorThrown);
                alert("Failed to add article. Please try again later.");
            });
    });
    
    
    
    // Remove article button click handler
    $(document).on("click", ".delete-article", function() {
        var articleId = $(this).data("id");
        $.post(`/api/remove-article/${articleId}`, function(response) {
            // Reload the article list
            loadArticles();
            alert(response.message); // Alert the response message
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Error removing article:", textStatus, errorThrown);
            alert("Failed to remove article. Please try again later.");
        });
    });
    
    // Read more link click handler
    $(document).on("click", ".read-more-link", function(event) {
        event.preventDefault();
        var articleId = $(this).attr("href").split("/").pop(); // Extract article ID from href
        // Redirect to the full article page
        window.location.href = `/article/${articleId}`;
    });
});

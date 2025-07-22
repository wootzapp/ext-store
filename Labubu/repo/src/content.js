console.log("Content script loaded");
console.log("Current page URL:", window.location.href);
console.log("Document ready state:", document.readyState);

class ContentScript {
  constructor() {
    this.isLoggedIn = false;
    this.setupMessageListener();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        console.log("🟢 Content: DOMContentLoaded event fired");
      });
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("🟢 Content: Received message:", message.type);

      switch (message.type) {
        case "PING":
          // Simple ping to check if content script is ready
          console.log("🟢 Content: Ping received, content script is ready");
          sendResponse({ success: true, ready: true });
          break;

        case "GET_CURRENT_URL":
          const currentUrl = window.location.href;
          console.log("🟢 Content: Returning current URL:", currentUrl);
          sendResponse({
            url: currentUrl,
          });
          break;

        case "EXTRACT_SEARCH_RESULTS":
          console.log(
            "🟢 Content: Extracting search results for:",
            message.searchQuery
          );
          this.extractSearchResults(message.searchQuery)
            .then((results) => {
              console.log(
                "🟢 Content: Successfully extracted",
                results.length,
                "results"
              );
              sendResponse({
                success: true,
                results: results,
              });
            })
            .catch((error) => {
              console.error(
                "🟢 Content: Error extracting results:",
                error.message
              );
              sendResponse({
                success: false,
                error: error.message,
              });
            });
          break;
        case "USER_PROFILE":
          console.log("🟢 Content: Extracting user profile");
          this.extractUserProfile()
            .then((profile) => {
              console.log(
                "🟢 Content: Successfully extracted user profile:",
                profile
              );
              sendResponse({
                success: true,
                profile: profile,
              });
            })
            .catch((error) => {
              sendResponse({
                success: false,
                error: error.message,
              });
            });
          return true;

        case "EXTRACT_PRODUCT_DETAILS":
          console.log("🟢 Content: Extracting product details");
          this.extractProductDetails(message.productPrice)
            .then((productDetails) => {
              console.log(
                "🟢 Content: Successfully extracted product details:",
                productDetails
              );
              sendResponse({
                success: true,
                productDetails: productDetails,
              });
            })
            .catch((error) => {
              sendResponse({
                success: false,
                error: error.message,
              });
            });
          return true;
        case "CHECK_PRODUCT_IN_CART":
          console.log("🟢 Content: Checking product in cart");
          this.checkProductInCart(message.productName)
            .then((inCart) => {
              console.log("🟢 Content: Product in cart:", inCart);
              sendResponse({
                success: true,
                inCart: inCart,
              });
            })
            .catch((error) => {
              sendResponse({
                success: false,
                error: error.message,
              });
            });
          return true;

        case "CLICK_ADD_TO_CART":
          console.log("🟢 Content: Clicking add to cart button");
          this.clickAddToCart()
            .then((success) => {
              console.log("🟢 Content: Add to cart click result:", success);
              sendResponse({
                success: success,
              });
            })
            .catch((error) => {
              console.error("🟢 Content: Error clicking add to cart:", error);
              sendResponse({
                success: false,
                error: error.message,
              });
            });
          return true;

        case "EXTRACT_CART_PRODUCTS":
          console.log("🟢 Content: Extracting cart products");
          this.extractCartProducts()
            .then((products) => {
              console.log("🟢 Content: Successfully extracted cart products:", products);
              sendResponse({
                success: true,
                products: products,
              });
            })
            .catch((error) => {
              console.error("🟢 Content: Error extracting cart products:", error);
              sendResponse({
                success: false,
                error: error.message,
              });
            });
          return true;

        case "EXTRACT_PRODUCT_DETAILS":
          console.log("🟢 Content: Extracting product details");
          this.extractProductDetails(message.productPrice)
        default:
          console.log("🟢 Content: Unknown message type:", message.type);
          sendResponse({ error: "Unknown message type" });
      }

      return true;
    });
  }

  async extractUserProfile() {
    try {
      console.log("🟢 Content: Extracting user profile");
      console.log("🟢 Content: Current URL:", window.location.href);

      const avatarSelectors = [
        ".index_avatar__k4xgD",
        ".index_avatarImg__fE1kn",
      ];

      let avatarUrl = "";
      for (const selector of avatarSelectors) {
        const avatarElement = document.querySelector(selector);
        if (avatarElement) {
          const img = avatarElement.querySelector("img") || avatarElement;
          if (img && img.src) {
            avatarUrl = img.src;
            console.log("🟢 Content: Found avatar with selector:", selector);
            break;
          } else if (
            avatarElement.style.backgroundImage &&
            avatarElement.style.backgroundImage.startsWith("url(")
          ) {
            avatarUrl = avatarElement.style.backgroundImage.slice(5, -2);
            console.log(
              "🟢 Content: Found avatar background with selector:",
              selector
            );
            break;
          }
        }
      }
      const usernameSelectors = [
        ".index_name__2CdgQ",
        ".index_nickname__pnxE6",
      ];

      let username = "";
      for (const selector of usernameSelectors) {
        const usernameElement = document.querySelector(selector);
        console.log(
          "🟢 Content: Trying username selector:",
          selector,
          "Found:",
          !!usernameElement
        );
        if (usernameElement) {
          let rawText = usernameElement.textContent || "";
          console.log("🟢 Content: Username element text:", rawText);
          let cleaned = rawText.trim();
          if (cleaned) {
            username = cleaned.replace(/sign out/gi, "").trim();
            console.log(
              "🟢 Content: Found username with selector:",
              selector,
              "Value:",
              username
            );
            break;
          }
        }
      }

      const profile = {
        avatar: avatarUrl,
        username: username,
      };
      console.log("🟢 Content: Extracted user profile:", profile);
      return profile;
    } catch (error) {
      console.error("🟢 Content: Error extracting user profile:", error);
      return {
        avatar: "",
        username: "User",
      };
    }
  }

  async extractSearchResults(searchQuery) {
    try {
      console.log("🟢 Content: Starting search result extraction");
      console.log("🟢 Content: Waiting for product elements to load...");
      await this.waitForElement(
        '[data-pm-exposure-tracker-action="PopMartGlobalWebCommodityCardShow"]',
        10000
      );
      console.log("🟢 Content: Product elements found");
      const productSelectors =
        '[data-pm-exposure-tracker-action="PopMartGlobalWebCommodityCardShow"]';

      let products = [];

      const elements = document.querySelectorAll(productSelectors);
      console.log(
        "🟢 Content: Found",
        elements.length,
        "elements with selector:",
        productSelectors
      );
      if (elements.length > 0) {
        products = Array.from(elements).slice(0, 5);
        console.log("🟢 Content: Using selector:", productSelectors);
      }

      if (products.length === 0) {
        console.log("🟢 Content: No products found with any selector");
        throw new Error("No search results found");
      }
      console.log("🟢 Content: Processing", products.length, "products");

      const results = products.map((product, index) => {
        console.log("🟢 Content: Processing product", index + 1);
        console.log("🟢 Content: Product element:", product);

        const nameElement = product.querySelector(
          ".index_itemTitle__WaT6_, .index_itemSubTitle__mX6v_, .product-name, .item-name, h3, h4, .title"
        );
        const priceElement = product.querySelector(
          ".index_itemPrice__AQoMy"
        );
        const imageElement = product.querySelector("img");

        const linkElement = product.closest("a") || product.querySelector("a");
        const link = linkElement?.href || window.location.href;

        console.log("🟢 Content: Link element found:", linkElement);
        console.log("🟢 Content: Link URL:", link);

        const subTitleElement = product.querySelector(
          ".index_itemSubTitle__mX6v_"
        );
        const titleElement = product.querySelector(".index_itemTitle__WaT6_");
        let fullName = "";

        if (subTitleElement && titleElement) {
          fullName = `${subTitleElement.textContent.trim()} - ${titleElement.textContent.trim()}`;
        } else if (nameElement) {
          fullName = nameElement.textContent.trim();
        } else {
          fullName = `Labubu Product ${index + 1}`;
        }

        const result = {
          id: index,
          name: fullName,
          price: priceElement?.textContent?.trim() || "Price not available",
          image:
            imageElement?.src || imageElement?.getAttribute("data-src") || "",
          url: link,
          relevance: index + 1,
        };
        return result;
      });

      console.log(
        "🟢 Content: Successfully extracted",
        results.length,
        "search results"
      );
      return results;
    } catch (error) {
      console.error("🟢 Content: Error extracting search results:", error);
      throw error;
    }
  }

  async extractProductDetails(productPrice) {
    try {
      
      console.log("🟢 Content: Starting product details extraction");
      console.log("🟢 Content: Current URL:", window.location.href);
      console.log("🟢 Content: Product price:", productPrice);


      await this.waitForElement(".products_container__T0mpL", 20000);
      const productContainer = document.querySelector(
        ".products_container__T0mpL"
      );
      console.log("🟢 Content: Product container found:", productContainer);

      let productImage = "";

      const imageSelectors = [
        ".index_imgContainer___mAnP img",
        ".index_imgContainer___mAnP .adm-image-img",
      ];

      console.log(
        "🟢 Content: Looking for product images with selectors:",
        imageSelectors
      );

      for (const selector of imageSelectors) {
        const imageElements = document.querySelectorAll(selector);
        console.log(
          "🟢 Content: Found",
          imageElements.length,
          "elements with selector:",
          selector
        );

        for (const imageElement of imageElements) {
          console.log("🟢 Content: Checking image element:", {
            src: imageElement.src,
            alt: imageElement.alt,
            className: imageElement.className,
            parentClassName: imageElement.parentElement?.className,
          });

          if (imageElement.src) {
            productImage = imageElement.src;
            console.log(
              "🟢 Content: Found product image with selector:",
              selector
            );
            console.log("🟢 Content: Image URL:", productImage);
            break;
          }
        }

        if (productImage) break;
      }

      console.log("🟢 Content: Looking for product name...");
      let productName = "";
      const nameSelectors = ".index_title___0OsZ";

        const nameElement = document.querySelector(nameSelectors);
        console.log(
          "🟢 Content: Checking name selector:",
          "Found:",
          !!nameElement
        );
        if (nameElement) {
          console.log(
            "🟢 Content: Name element text:",
            nameElement.textContent.trim()
          );
        }
        if (nameElement && nameElement.textContent.trim()) {
          productName = nameElement.textContent.trim();
          console.log(
            "🟢 Content: Found product name with selector:",
          );
          console.log("🟢 Content: Product name:", productName);
        }

      const productDetails = {
        name: productName || "Product",
        image: productImage,
        price: productPrice,
        url: window.location.href,
      };

      console.log("🟢 Content: Extracted product details:", productDetails);
      return productDetails;
    } catch (error) {
      console.error("🟢 Content: Error extracting product details:", error);
      throw error;
    }
  }
  async waitForElement(selector, timeout = 5000) {
    console.log("🟢 Content: Waiting for element:", selector);
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        console.log("🟢 Content: Element found immediately:", selector);
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          console.log("🟢 Content: Element found via observer:", selector);
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
              console.log("🟢 Content: Element not found within timeout:", selector);
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

async checkProductInCart(productName) {
  console.log("🟢 Content: Checking product in cart:", productName);
  await this.waitForElement(".product_productName__TwvLM", 60000);
  const cartList = document.querySelector(".index_contentLeft__OnEFB");
  console.log("🟢 Content: Cart list found:", cartList);
  const cartProductNames = document.querySelectorAll(".product_productName__TwvLM");
  console.log("🟢 Content: Found", cartProductNames.length, "products in cart");
  for (const productElement of cartProductNames) {
    const cartProductName = productElement.textContent.trim();
    console.log("🟢 Content: Comparing cart product:", cartProductName, "with:", productName);
  }
  try {
    const cartProductNames = document.querySelectorAll(".product_productName__TwvLM");
    console.log("🟢 Content: Found", cartProductNames.length, "products in cart");
    
    for (const productElement of cartProductNames) {
      const cartProductName = productElement.textContent.trim();
      console.log("🟢 Content: Comparing cart product:", cartProductName, "with:", productName);
      
      if (cartProductName === productName) {
        console.log("🟢 Content: Product found in cart!");
        return true;
      }
    }
    
    console.log("🟢 Content: Product not found in cart");
    return false;
  } catch (error) {
    console.error("🟢 Content: Error checking product in cart:", error);
    return false;
  }
}

  async clickAddToCart() {
    try {
      console.log("🟢 Content: Starting add to cart click");
      await this.waitForElement(".index_fixBottomBtn__Y3cIe", 10000);
      
      const addToCartButton = document.querySelector(".index_fixBottomBtn__Y3cIe");
      console.log("🟢 Content: Add to cart button found:", addToCartButton);
      
      if (!addToCartButton) {
        console.log("🟢 Content: Add to cart button not found");
        return false;
      }
      
      const buttonText = addToCartButton.textContent.trim();
      console.log("🟢 Content: Button text:", buttonText);
      
      console.log("🟢 Content: Clicking add to cart button");
      addToCartButton.click();
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("🟢 Content: Add to cart click completed successfully");
      return true;
      
    } catch (error) {
      console.error("🟢 Content: Error clicking add to cart button:", error);
      return false;
    }
  }

  async extractCartProducts() {
    try {
      console.log("🟢 Content: Starting cart products extraction");
      console.log("🟢 Content: Current URL:", window.location.href);

      const selectors = [
        ".product_productName__TwvLM",
        ".product_productContainer__JPqj",
        "[class*='productContainer']",
        "[class*='productName']"
      ];
      
      let cartProductElements = [];
      for (const selector of selectors) {
        cartProductElements = document.querySelectorAll(selector);
        if (cartProductElements.length > 0) {
          console.log("🟢 Content: Found products with selector:", selector);
          break;
        }
      }
      
      if (cartProductElements.length === 0) {
        await this.waitForElement("[class*='product']", 10000);
        cartProductElements = document.querySelectorAll("[class*='productContainer']");
      }
      
      console.log("🟢 Content: Found", cartProductElements.length, "cart products");

      const products = [];

      for (let i = 0; i < cartProductElements.length; i++) {
        const productContainer = cartProductElements[i];
        console.log("🟢 Content: Processing cart product", i + 1);

        const nameElement = productContainer.querySelector(".product_productName__TwvLM, [class*='productName']");
        const productName = nameElement ? nameElement.textContent.trim() : "Product Name Not Available";
        
        const priceElement = productContainer.querySelector(".product_productPrice__vmBKG, [class*='productPrice'], [class*='price']");
        const price = priceElement ? priceElement.textContent.trim() : "Price not available";
        
        const imageElement = productContainer.querySelector("img");
        const image = imageElement ? (imageElement.src || imageElement.getAttribute("data-src")) : "";
        
        const linkElement = productContainer.querySelector("a");
        const url = linkElement ? linkElement.href : window.location.href;

        const product = {
          id: Date.now().toString() + i,
          name: productName,
          price: price,
          image: image,
          url: url,
          addedAt: new Date().toISOString()
        };

        console.log("🟢 Content: Extracted cart product:", product);
        products.push(product);
      }

      console.log("🟢 Content: Successfully extracted", products.length, "cart products");
      return products;
      
    } catch (error) {
      console.error("🟢 Content: Error extracting cart products:", error);
      throw error;
    }
  }
}

const contentScript = new ContentScript();

console.log("🔵 LABUBU CONTENT SCRIPT INITIALIZED 🔵");


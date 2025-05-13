
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  readTime: number;
  categories: string[];
  author: {
    name: string;
    avatar: string;
  };
}

// Blog posts will be fetched from the API
export const blogPosts: BlogPost[] = [];

// Helper functions for blog posts
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  console.log('getBlogPostBySlug called with:', slug);
  // In the real implementation, this would make an API call
  return undefined;
}

export function getRecentBlogPosts(count: number = 3): BlogPost[] {
  console.log('getRecentBlogPosts called with count:', count);
  // In the real implementation, this would make an API call
  return [];
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  console.log('getBlogPostsByCategory called with:', category);
  // In the real implementation, this would make an API call
  return [];
}

export function searchBlogPosts(query: string): BlogPost[] {
  console.log('searchBlogPosts called with:', query);
  // In the real implementation, this would make an API call
  return [];
}

export const sampleBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Authentic Indian Butter Chicken Recipe",
    slug: "authentic-indian-butter-chicken-recipe",
    excerpt: "Learn how to make the perfect butter chicken with our aromatic spice blend that brings out authentic flavors.",
    content: `
      <h2>Introduction</h2>
      <p>Butter Chicken, or Murgh Makhani, is one of India's most beloved dishes. This creamy, tomato-based curry is known for its mild flavor and velvety texture. Our recipe focuses on using the perfect blend of Manglanam spices to achieve that authentic taste.</p>
      
      <h2>Ingredients</h2>
      <h3>For the marinade:</h3>
      <ul>
        <li>800g boneless chicken thighs, cut into bite-sized pieces</li>
        <li>1 cup plain yogurt</li>
        <li>2 tablespoons lemon juice</li>
        <li>2 teaspoons Manglanam Garam Masala</li>
        <li>2 teaspoons Manglanam Kashmiri Red Chili Powder</li>
        <li>2 teaspoons Manglanam Turmeric Powder</li>
        <li>2 teaspoons ground cumin</li>
        <li>1 tablespoon ginger paste</li>
        <li>1 tablespoon garlic paste</li>
      </ul>
      
      <h3>For the sauce:</h3>
      <ul>
        <li>4 tablespoons butter</li>
        <li>2 tablespoons oil</li>
        <li>2 cups tomato puree</li>
        <li>1 cup heavy cream</li>
        <li>2 tablespoons Manglanam Fenugreek Leaves (Kasuri Methi)</li>
        <li>1 teaspoon Manglanam Garam Masala</li>
        <li>1 teaspoon Manglanam Cardamom Powder</li>
        <li>Salt to taste</li>
        <li>1 tablespoon sugar</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>In a large bowl, combine all marinade ingredients with the chicken pieces. Cover and refrigerate for at least 2 hours, preferably overnight.</li>
        <li>Preheat your oven to 220°C/430°F. Place marinated chicken pieces on a baking tray and cook for 15 minutes until slightly charred.</li>
        <li>Meanwhile, heat butter and oil in a large pot over medium heat. Add tomato puree and simmer for 15 minutes until the sauce thickens.</li>
        <li>Add cream, fenugreek leaves, garam masala, cardamom powder, salt, and sugar. Stir well and simmer for 5 minutes.</li>
        <li>Add the cooked chicken pieces to the sauce and simmer for another 5-10 minutes.</li>
        <li>Serve hot with naan bread or rice.</li>
      </ol>
      
      <h2>Chef's Tips</h2>
      <p>For an extra rich taste, add a tablespoon of ghee just before serving. If you prefer a spicier version, add more Kashmiri red chili powder to the marinade.</p>
      
      <p>This butter chicken recipe showcases the perfect balance of spices that Manglanam Spices is known for. The key is to use fresh, high-quality spices for the most authentic flavor.</p>
    `,
    image: "/images/blog/butter-chicken.jpg",
    date: "April 2, 2025",
    readTime: 8,
    categories: ["Recipe", "Indian Cuisine", "Main Course"],
    author: {
      name: "Priya Sharma",
      avatar: "/images/avatars/priya.jpg"
    }
  },
  {
    id: "2",
    title: "The Complete Guide to Turmeric: Health Benefits and Culinary Uses",
    slug: "complete-guide-to-turmeric",
    excerpt: "Discover the amazing health benefits of turmeric and how to incorporate this golden spice into your daily cooking.",
    content: `
      <h2>The Golden Spice</h2>
      <p>Turmeric, also known as "Indian saffron," has been used for thousands of years in Ayurvedic medicine and cooking. Its vibrant golden color comes from curcumin, the active compound responsible for most of its health benefits.</p>
      
      <h2>Health Benefits</h2>
      <p>Turmeric has gained global recognition for its impressive health properties:</p>
      <ul>
        <li><strong>Anti-inflammatory:</strong> Curcumin in turmeric has powerful anti-inflammatory effects, comparable to some pharmaceutical drugs but without side effects.</li>
        <li><strong>Antioxidant:</strong> It helps neutralize free radicals and boosts the body's natural antioxidant enzymes.</li>
        <li><strong>Brain Function:</strong> Curcumin can increase brain-derived neurotrophic factor (BDNF), linked to improved brain function and lower risk of brain diseases.</li>
        <li><strong>Heart Health:</strong> It improves the function of the endothelium (blood vessel lining) and reduces inflammation and oxidation.</li>
        <li><strong>Joint Health:</strong> Many people with arthritis report reduced pain and improved mobility with regular turmeric consumption.</li>
      </ul>
      
      <h2>Culinary Uses</h2>
      <p>Beyond its health benefits, turmeric adds earthy, slightly bitter flavors to dishes:</p>
      <ul>
        <li><strong>Golden Milk:</strong> A warm, soothing beverage made with milk, turmeric, and other spices.</li>
        <li><strong>Curries:</strong> An essential component in most Indian curries.</li>
        <li><strong>Rice Dishes:</strong> Adds color and flavor to biryani and pulao.</li>
        <li><strong>Soups and Stews:</strong> A pinch adds depth and color.</li>
        <li><strong>Smoothies:</strong> Boost your morning smoothie with 1/4 teaspoon of turmeric.</li>
        <li><strong>Roasted Vegetables:</strong> Toss vegetables with olive oil, turmeric, and black pepper before roasting.</li>
      </ul>
      
      <h2>How to Use Manglanam Turmeric</h2>
      <p>Manglanam's Premium Turmeric Powder is sourced from the finest farms in India, ensuring high curcumin content and superior flavor. Here's how to get the most from it:</p>
      <ol>
        <li>Always pair turmeric with black pepper - it enhances curcumin absorption by up to 2000%.</li>
        <li>Start with small amounts (1/4 to 1/2 teaspoon) when adding to new recipes.</li>
        <li>Add turmeric early in the cooking process, allowing it to release its flavors into oil or liquid.</li>
        <li>Store in a cool, dark place to maintain freshness and potency.</li>
      </ol>
      
      <h2>Simple Turmeric Recipe: Golden Milk</h2>
      <p><strong>Ingredients:</strong></p>
      <ul>
        <li>1 cup milk (dairy or plant-based)</li>
        <li>1/2 teaspoon Manglanam Turmeric Powder</li>
        <li>1/4 teaspoon Manglanam Cinnamon Powder</li>
        <li>1 pinch of Manglanam Black Pepper</li>
        <li>1/2 teaspoon honey or maple syrup</li>
        <li>1/4 teaspoon ghee or coconut oil (optional)</li>
      </ul>
      
      <p><strong>Instructions:</strong></p>
      <ol>
        <li>Warm the milk in a small saucepan over medium heat.</li>
        <li>Add turmeric, cinnamon, black pepper, and ghee if using.</li>
        <li>Whisk until well combined and heated through (do not boil).</li>
        <li>Remove from heat, strain if desired, and add sweetener.</li>
        <li>Enjoy before bedtime for best results.</li>
      </ol>
      
      <p>Incorporate this golden spice into your daily routine and experience the wonderful benefits it has to offer!</p>
    `,
    image: "/images/blog/turmeric-guide.jpg",
    date: "March 28, 2025",
    readTime: 10,
    categories: ["Spice Guide", "Health & Wellness", "Ingredients"],
    author: {
      name: "Dr. Rajesh Kumar",
      avatar: "/images/avatars/rajesh.jpg"
    }
  },
  {
    id: "3",
    title: "5 Essential Spices Every Home Cook Should Have",
    slug: "essential-spices-home-cook",
    excerpt: "Build a versatile spice collection with these five must-have spices that will transform your everyday cooking.",
    content: `
      <h2>Building Your Essential Spice Collection</h2>
      <p>Whether you're a beginner or experienced cook, having a well-stocked spice cabinet is the secret to creating delicious meals. Here are the five essential spices we recommend every home cook should have:</p>
      
      <h3>1. Cumin (Jeera)</h3>
      <p>Cumin is the backbone of many cuisines, from Indian and Middle Eastern to Mexican and Mediterranean.</p>
      <p><strong>Flavor Profile:</strong> Earthy, warm, with a slight citrus undertone</p>
      <p><strong>Best Used In:</strong> Curries, rice dishes, bean preparations, chili, soups, vegetable dishes, meat rubs</p>
      <p><strong>Cooking Tip:</strong> Toast whole cumin seeds in a dry pan before grinding for a more intense flavor. Add ground cumin early in cooking to allow its flavors to bloom.</p>
      
      <h3>2. Coriander (Dhania)</h3>
      <p>The perfect partner to cumin, coriander seeds are the dried berries of the cilantro plant.</p>
      <p><strong>Flavor Profile:</strong> Bright, slightly citrusy, with sweet and floral notes</p>
      <p><strong>Best Used In:</strong> Curries, soups, stews, marinades, spice rubs, pickling blends</p>
      <p><strong>Cooking Tip:</strong> Like cumin, coriander benefits from toasting before grinding. It pairs excellently with fish, chicken, and vegetables.</p>
      
      <h3>3. Turmeric (Haldi)</h3>
      <p>Beyond its health benefits, turmeric adds beautiful color and earthy flavor to dishes.</p>
      <p><strong>Flavor Profile:</strong> Earthy, slightly bitter, peppery</p>
      <p><strong>Best Used In:</strong> Curries, rice dishes, soups, smoothies, golden milk, roasted vegetables</p>
      <p><strong>Cooking Tip:</strong> A little goes a long way. Start with 1/4 teaspoon and add more as needed. Always pair with black pepper to enhance absorption.</p>
      
      <h3>4. Cardamom (Elaichi)</h3>
      <p>Often called the "Queen of Spices," cardamom works in both sweet and savory dishes.</p>
      <p><strong>Flavor Profile:</strong> Intensely aromatic, sweet, with notes of mint, lemon, and eucalyptus</p>
      <p><strong>Best Used In:</strong> Rice dishes, curries, chai tea, coffee, baked goods, desserts</p>
      <p><strong>Cooking Tip:</strong> Green cardamom is more versatile than black. For savory dishes, use whole pods; for desserts, use ground cardamom.</p>
      
      <h3>5. Garam Masala</h3>
      <p>This blend of warming spices is essentially Indian cuisine in a bottle.</p>
      <p><strong>Flavor Profile:</strong> Complex, warm, sweet and savory</p>
      <p><strong>Best Used In:</strong> Curries, lentil dishes, vegetable preparations, rice, meat dishes</p>
      <p><strong>Cooking Tip:</strong> Add garam masala toward the end of cooking to preserve its aromatic qualities. Manglanam's Garam Masala is particularly balanced, with notes of cinnamon, cloves, cardamom, and cumin.</p>
      
      <h2>Building Beyond the Basics</h2>
      <p>Once you have these five essentials, consider expanding your collection with:</p>
      <ul>
        <li>Cinnamon - for both sweet and savory dishes</li>
        <li>Black pepper - the world's most common spice</li>
        <li>Red chili powder - for heat and color</li>
        <li>Mustard seeds - great for tempering dishes</li>
        <li>Fennel seeds - for a subtle anise flavor</li>
      </ul>
      
      <h2>Simple Recipe: Versatile Spice Rub</h2>
      <p>This all-purpose spice rub uses all five essential spices and works on vegetables, chicken, fish, or meat.</p>
      <p><strong>Ingredients:</strong></p>
      <ul>
        <li>2 tablespoons ground cumin</li>
        <li>1 tablespoon ground coriander</li>
        <li>1 teaspoon turmeric</li>
        <li>1/2 teaspoon ground cardamom</li>
        <li>1 teaspoon garam masala</li>
        <li>1 teaspoon salt</li>
        <li>1/2 teaspoon black pepper</li>
      </ul>
      <p><strong>Instructions:</strong> Combine all ingredients in a jar and shake well. Rub on protein or vegetables before cooking. Store in an airtight container away from heat and light for up to 3 months.</p>
      
      <p>With these five essential spices, you'll be amazed at how you can transform simple ingredients into extraordinary meals!</p>
    `,
    image: "/images/blog/essential-spices.jpg",
    date: "March 22, 2025",
    readTime: 7,
    categories: ["Spice Guide", "Cooking Tips", "Beginners"],
    author: {
      name: "Chef Anand Kapoor",
      avatar: "/images/avatars/anand.jpg"
    }
  },
  {
    id: "4",
    title: "How to Make Perfect Biryani at Home",
    slug: "perfect-biryani-recipe",
    excerpt: "Master the art of making authentic, aromatic biryani with our step-by-step recipe and professional tips.",
    content: `
      <h2>The Art of Biryani</h2>
      <p>Biryani is more than just a rice dish—it's a celebration of flavors, aromas, and textures that has been perfected over centuries. This layered rice dish originated in the Indian subcontinent and has countless regional variations.</p>
      
      <h2>Ingredients</h2>
      <h3>For the rice:</h3>
      <ul>
        <li>2 cups basmati rice, soaked for 30 minutes</li>
        <li>6 cups water</li>
        <li>2 bay leaves</li>
        <li>4 green cardamom pods</li>
        <li>6 cloves</li>
        <li>1 cinnamon stick</li>
        <li>1 star anise</li>
        <li>1 teaspoon salt</li>
      </ul>
      
      <h3>For the meat/vegetable mixture:</h3>
      <ul>
        <li>500g chicken, lamb, or mixed vegetables</li>
        <li>2 large onions, thinly sliced</li>
        <li>2 tablespoons ginger-garlic paste</li>
        <li>2 green chilies, slit</li>
        <li>2 tomatoes, chopped</li>
        <li>1/2 cup plain yogurt</li>
        <li>3 tablespoons Manglanam Biryani Masala</li>
        <li>1/2 teaspoon Manglanam Turmeric Powder</li>
        <li>1 teaspoon red chili powder (adjust to taste)</li>
        <li>Salt to taste</li>
        <li>3 tablespoons ghee or oil</li>
        <li>1/4 cup fresh mint leaves</li>
        <li>1/4 cup fresh coriander leaves</li>
      </ul>
      
      <h3>For layering and garnish:</h3>
      <ul>
        <li>A few strands of saffron soaked in 1/4 cup warm milk</li>
        <li>2 tablespoons ghee</li>
        <li>1/2 cup fried onions</li>
        <li>1/4 cup fresh mint leaves</li>
        <li>1/4 cup fresh coriander leaves</li>
        <li>2 tablespoons lemon juice</li>
      </ul>
      
      <h2>Instructions</h2>
      <h3>Prepare the rice:</h3>
      <ol>
        <li>In a large pot, bring water to a boil with bay leaves, cardamom, cloves, cinnamon, star anise, and salt.</li>
        <li>Add soaked and drained rice, cook until it's 70% done (still has a slight bite). This usually takes about 5-6 minutes.</li>
        <li>Drain the rice and set aside. Save some of the aromatic water.</li>
      </ol>
      
      <h3>Prepare the meat/vegetable mixture:</h3>
      <ol>
        <li>Heat ghee in a heavy-bottomed pot. Add sliced onions and fry until golden brown.</li>
        <li>Add ginger-garlic paste and green chilies. Sauté until the raw smell disappears.</li>
        <li>Add meat or vegetables, and cook on high heat for 5 minutes.</li>
        <li>Add tomatoes, turmeric, red chili powder, and Manglanam Biryani Masala. Cook for 2-3 minutes.</li>
        <li>Lower the heat, add yogurt, and cook until the meat is tender or vegetables are partially cooked. The mixture should have some gravy but not be too watery.</li>
        <li>Stir in half of the mint and coriander leaves.</li>
      </ol>
      
      <h3>Layer and cook the biryani:</h3>
      <ol>
        <li>In the same pot with the meat/vegetable mixture, layer half of the par-cooked rice.</li>
        <li>Sprinkle half of the saffron milk, remaining mint and coriander leaves, and half of the fried onions.</li>
        <li>Add the remaining rice, creating a mound. Pour the remaining saffron milk on top.</li>
        <li>Sprinkle lemon juice, remaining fried onions, and drizzle 2 tablespoons of ghee around the edges.</li>
        <li>Cover the pot with a tight-fitting lid. You can place a damp cloth between the pot and lid to seal in the steam.</li>
        <li>Cook on low heat for 20-25 minutes. Let it rest for 10 minutes before opening.</li>
        <li>Gently mix the layers before serving.</li>
      </ol>
      
      <h2>Chef's Tips for Perfect Biryani</h2>
      <ol>
        <li><strong>Rice quality:</strong> Always use aged, long-grain basmati rice for authentic biryani.</li>
        <li><strong>Soaking:</strong> Don't skip soaking the rice, as it helps achieve perfectly cooked grains.</li>
        <li><strong>Partial cooking:</strong> The rice should be about 70% cooked before layering—it will finish cooking with the steam.</li>
        <li><strong>Sealing:</strong> Create a proper seal for the pot to trap steam, which cooks the rice through the "dum" (steam) process.</li>
        <li><strong>Ghee:</strong> Use good quality ghee for authentic flavor.</li>
        <li><strong>Layering:</strong> Be gentle when layering to keep the rice grains intact.</li>
        <li><strong>Resting:</strong> Allow the biryani to rest before serving; this helps the flavors meld.</li>
      </ol>
      
      <p>Serve your homemade biryani with raita (yogurt sauce), mirchi ka salan (chili curry), or a simple salad. This recipe serves 4-6 people and can be adapted for vegetarian options by substituting meat with paneer, mixed vegetables, or soya chunks.</p>
      
      <p>Enjoy this royal dish that brings together the finest spices in a harmonious blend!</p>
    `,
    image: "/images/blog/biryani.jpg",
    date: "March 15, 2025",
    readTime: 12,
    categories: ["Recipe", "Indian Cuisine", "Main Course"],
    author: {
      name: "Chef Anand Kapoor",
      avatar: "/images/avatars/anand.jpg"
    }
  },
  {
    id: "5",
    title: "Spices for Better Sleep: Natural Remedies from Your Kitchen",
    slug: "spices-for-better-sleep",
    excerpt: "Discover how common kitchen spices can help improve your sleep quality naturally without medication.",
    content: `
      <h2>The Ancient Wisdom of Spices for Sleep</h2>
      <p>In our fast-paced world, quality sleep is increasingly elusive. Before turning to medication, consider the natural sleep aids that might already be in your spice cabinet. Ancient Ayurvedic and traditional medicine systems have long recognized the sleep-promoting properties of certain spices.</p>
      
      <h2>Top Spices for Better Sleep</h2>
      
      <h3>1. Nutmeg</h3>
      <p><strong>How it helps:</strong> Nutmeg contains myristicin and elemicin, compounds that act as mild sedatives. It has been used traditionally to relieve insomnia and promote relaxation.</p>
      <p><strong>How to use:</strong> Add a small pinch (no more than 1/4 teaspoon) of Manglanam Nutmeg Powder to warm milk with honey before bedtime. Be cautious not to use too much, as nutmeg in large amounts can cause adverse effects.</p>
      
      <h3>2. Cardamom</h3>
      <p><strong>How it helps:</strong> Cardamom has a calming effect on the body and helps relieve stress and anxiety, common culprits behind sleepless nights. It also aids digestion, which can help prevent discomfort that may keep you awake.</p>
      <p><strong>How to use:</strong> Add 2-3 crushed Manglanam Green Cardamom pods to herbal tea or warm milk. You can combine it with other sleep-promoting spices for enhanced effects.</p>
      
      <h3>3. Saffron</h3>
      <p><strong>How it helps:</strong> Known as a natural antidepressant, saffron can help manage anxiety and improve mood. Research suggests it may help with insomnia and sleep quality.</p>
      <p><strong>How to use:</strong> Steep a few strands of Manglanam Saffron in warm milk with a touch of honey. Drink 30 minutes before bedtime.</p>
      
      <h3>4. Cinnamon</h3>
      <p><strong>How it helps:</strong> Cinnamon helps stabilize blood sugar levels, which can prevent middle-of-the-night awakenings caused by blood sugar drops. It also has a warming, calming effect on the body.</p>
      <p><strong>How to use:</strong> Add 1/2 teaspoon of Manglanam Cinnamon Powder to herbal tea, warm milk, or apple juice before bed.</p>
      
      <h3>5. Turmeric</h3>
      <p><strong>How it helps:</strong> Curcumin, the active compound in turmeric, has anti-inflammatory properties that may help reduce sleep disturbances. It also promotes relaxation and can ease digestive discomfort.</p>
      <p><strong>How to use:</strong> Prepare golden milk by mixing 1/2 teaspoon Manglanam Turmeric Powder with warm milk, a pinch of black pepper, and honey.</p>
      
      <h2>Sleep-Enhancing Spice Blends</h2>
      <p>Combining spices can enhance their sleep-promoting effects. Here are two simple blends to try:</p>
      
      <h3>Calming Sleep Blend</h3>
      <p><strong>Ingredients:</strong></p>
      <ul>
        <li>1 teaspoon Manglanam Cinnamon Powder</li>
        <li>1/2 teaspoon Manglanam Cardamom Powder</li>
        <li>1/4 teaspoon Manglanam Nutmeg Powder</li>
        <li>1/2 teaspoon Manglanam Ginger Powder</li>
      </ul>
      <p><strong>Instructions:</strong> Mix all spices together and store in an airtight container. Use 1/4 teaspoon of this blend in warm milk or herbal tea before bedtime.</p>
      
      <h3>Golden Sleep Tonic</h3>
      <p><strong>Ingredients:</strong></p>
      <ul>
        <li>1 cup milk (dairy or plant-based)</li>
        <li>1/2 teaspoon Manglanam Turmeric Powder</li>
        <li>1/4 teaspoon Manglanam Cinnamon Powder</li>
        <li>1 pinch Manglanam Nutmeg Powder</li>
        <li>3-4 strands Manglanam Saffron</li>
        <li>1 teaspoon honey</li>
        <li>1 pinch black pepper</li>
      </ul>
      <p><strong>Instructions:</strong> Warm the milk (do not boil). Add all spices and whisk well. Let it steep for 5 minutes. Add honey, strain if desired, and drink 30-45 minutes before bedtime.</p>
      
      <h2>Additional Sleep Tips</h2>
      <p>To maximize the benefits of these spice remedies, incorporate these sleep hygiene practices:</p>
      <ul>
        <li>Maintain a regular sleep schedule, even on weekends</li>
        <li>Create a restful environment (cool, dark, quiet)</li>
        <li>Avoid caffeine and heavy meals before bedtime</li>
        <li>Limit screen time at least one hour before sleep</li>
        <li>Practice relaxation techniques like deep breathing or meditation</li>
      </ul>
      
      <h2>When to Seek Help</h2>
      <p>While spices can help with occasional sleep issues, persistent insomnia may require professional attention. Consult a healthcare provider if sleep problems continue for more than a few weeks or are accompanied by other symptoms.</p>
      
      <p>Nature has provided us with gentle remedies for many of life's challenges, including sleep difficulties. These spices offer a holistic approach to improving sleep quality without the side effects often associated with sleep medications.</p>
    `,
    image: "/images/blog/sleep-spices.jpg",
    date: "March 10, 2025",
    readTime: 9,
    categories: ["Health & Wellness", "Spice Guide", "Natural Remedies"],
    author: {
      name: "Dr. Rajesh Kumar",
      avatar: "/images/avatars/rajesh.jpg"
    }
  },
  {
    id: "6",
    title: "Mastering Chai: The Perfect Indian Spiced Tea",
    slug: "mastering-chai-spiced-tea",
    excerpt: "Learn the secrets to brewing the perfect cup of authentic Indian chai with our premium spice blend.",
    content: `
      <h2>The Soul of Indian Hospitality</h2>
      <p>A steaming cup of chai is more than just a beverage in India—it's a ritual, a comfort, and the heart of hospitality. Whether served in a clay cup at a roadside stall or in fine china at home, authentic Indian chai is a spiced tea that awakens the senses and nourishes the soul.</p>
      
      <h2>The Art and Science of Chai</h2>
      <p>Perfect chai is a balance of tea, milk, sweetener, and spices. The proportions may vary by region and personal preference, but the fundamental technique remains consistent.</p>
      
      <h3>Essential Ingredients</h3>
      <ul>
        <li>2 cups water</li>
        <li>1 cup milk (whole milk is traditional, but any milk works)</li>
        <li>2 tablespoons loose black tea (like Assam or Darjeeling)</li>
        <li>2-3 teaspoons Manglanam Chai Masala (or the spice blend below)</li>
        <li>2-3 teaspoons sugar or jaggery (adjust to taste)</li>
      </ul>
      
      <h3>For Homemade Chai Masala</h3>
      <ul>
        <li>4 tablespoons Manglanam Cardamom Powder</li>
        <li>1 tablespoon Manglanam Cinnamon Powder</li>
        <li>1 tablespoon Manglanam Ginger Powder</li>
        <li>1 teaspoon Manglanam Clove Powder</li>
        <li>1 teaspoon Manglanam Black Pepper</li>
        <li>1/2 teaspoon Manglanam Nutmeg Powder</li>
      </ul>
      <p>Mix all spices together and store in an airtight container. This blend will keep for 3 months.</p>
      
      <h2>The Perfect Method</h2>
      <ol>
        <li><strong>Boil the water and spices:</strong> In a saucepan, bring water to a boil with the chai masala. Let it simmer for 2-3 minutes to extract the spice flavors.</li>
        <li><strong>Add the tea:</strong> Add loose tea leaves and let the mixture boil for another 2 minutes until the water turns a deep amber color.</li>
        <li><strong>Add milk:</strong> Pour in the milk and bring the mixture back to a boil. Watch carefully as it can quickly boil over!</li>
        <li><strong>Let it rise:</strong> Allow the chai to rise up in the pot 2-3 times (reduce heat slightly if it's boiling too vigorously). This creates the characteristic rich flavor and creamy texture.</li>
        <li><strong>Add sweetener:</strong> Stir in sugar or jaggery until dissolved.</li>
        <li><strong>Strain and serve:</strong> Strain the chai into cups and serve immediately.</li>
      </ol>
      
      <h2>Regional Chai Variations</h2>
      <p>India's vast cultural diversity has given rise to numerous chai variations. Here are a few you might want to try:</p>
      
      <h3>Kashmiri Pink Chai (Noon Chai)</h3>
      <p>A distinctive pink-colored tea made with special Kashmiri tea leaves, cardamom, cinnamon, star anise, and a pinch of baking soda (which creates the pink color). Usually topped with crushed pistachios and almonds.</p>
      
      <h3>Bombay Cutting Chai</h3>
      <p>A strong, heavily spiced chai served in small glasses ("cutting" refers to the small portion). It features a higher tea-to-water ratio and extra ginger and cardamom.</p>
      
      <h3>Masala Chai</h3>
      <p>The classic spiced chai that most people associate with Indian tea. Our recipe above is a version of masala chai.</p>
      
      <h3>Adrak Wali Chai (Ginger Tea)</h3>
      <p>Emphasizes fresh ginger for its warming properties, making it perfect for chilly days or when feeling under the weather.</p>
      
      <h3>Malai Chai</h3>
      <p>Topped with a layer of malai (clotted cream), this indulgent version is rich and creamy.</p>
      
      <h2>The Perfect Chai Pairings</h2>
      <p>In India, chai is rarely enjoyed alone. Here are some traditional accompaniments:</p>
      <ul>
        <li><strong>Biscuits:</strong> Parle-G, Nice, or Marie biscuits are classic chai companions</li>
        <li><strong>Samosas:</strong> The contrast of spicy, savory pastries with sweet chai is unbeatable</li>
        <li><strong>Pakoras:</strong> These crispy fritters are perfect with afternoon chai</li>
        <li><strong>Namkeen:</strong> Savory snack mixes balance the sweetness of chai</li>
        <li><strong>Toast:</strong> Simple buttered toast is a common breakfast pairing</li>
      </ul>
      
      <h2>Chai Etiquette and Culture</h2>
      <p>In Indian households, chai is integral to hospitality. Refusing a cup might be considered impolite! Chai is typically served to guests within minutes of their arrival, often accompanied by small snacks. It facilitates conversation and creates a warm atmosphere.</p>
      
      <p>The roadside chai wallahs (tea vendors) are cultural institutions in their own right, serving quick cups to busy commuters and becoming community hubs where people exchange news and gossip.</p>
      
      <h2>Modern Chai Innovations</h2>
      <p>While traditional chai is timeless, creative variations have emerged:</p>
      <ul>
        <li><strong>Chai Latte:</strong> A Western adaptation with frothed milk</li>
        <li><strong>Iced Chai:</strong> Perfect for summer, served over ice</li>
        <li><strong>Chai-Infused Desserts:</strong> From ice cream to cakes to cookies</li>
        <li><strong>Dirty Chai:</strong> Chai with a shot of espresso</li>
      </ul>
      
      <p>However you enjoy it, chai connects you to a rich tradition of flavor, comfort, and hospitality. Experiment with the spice ratios to find your perfect cup!</p>
    `,
    image: "/images/blog/masala-chai.jpg",
    date: "March 5, 2025",
    readTime: 8,
    categories: ["Recipe", "Beverages", "Indian Cuisine"],
    author: {
      name: "Priya Sharma",
      avatar: "/images/avatars/priya.jpg"
    }
  }
];

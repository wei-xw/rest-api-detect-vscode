package cn.techwolf.example;

import org.springframework.web.bind.annotation.*;

/**
 * 商品管理RESTful接口
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    /**
     * 获取所有商品列表
     * @return 商品列表
     */
    @GetMapping
    public String getAllProducts() {
        return "This would return all products";
    }

    /**
     * 根据ID获取商品
     * @param id 商品ID
     * @return 商品信息
     */
    @GetMapping("/{id}")
    public String getProductById(@PathVariable Long id) {
        return "This would return product with ID: " + id;
    }

    /**
     * 创建新商品
     * @return 创建结果
     */
    @PostMapping
    public String createProduct() {
        return "This would create a new product";
    }

    /**
     * 更新商品信息
     * @param id 商品ID
     * @return 更新结果
     */
    @PutMapping("/{id}")
    public String updateProduct(@PathVariable Long id) {
        return "This would update product with ID: " + id;
    }

    /**
     * 删除商品
     * @param id 商品ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        return "This would delete product with ID: " + id;
    }

    /**
     * 搜索商品
     * @param keyword 关键词
     * @return 搜索结果
     */
    @RequestMapping(value = "/search", method = RequestMethod.GET)
    public String searchProducts(@RequestParam String keyword) {
        return "This would search products with keyword: " + keyword;
    }
} 
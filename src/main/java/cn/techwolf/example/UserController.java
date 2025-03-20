package cn.techwolf.example;

import org.springframework.web.bind.annotation.*;

/**
 * 用户管理RESTful接口
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    /**
     * 获取所有用户列表
     * @return 用户列表
     */
    @GetMapping
    public String getAllUsers() {
        return "This would return all users";
    }

    /**
     * 根据ID获取用户
     * @param id 用户ID
     * @return 用户信息
     */
    @GetMapping("/{id}")
    public String getUserById(@PathVariable Long id) {
        return "This would return user with ID: " + id;
    }

    /**
     * 创建新用户
     * @return 创建结果
     */
    @PostMapping
    public String createUser() {
        return "This would create a new user";
    }

    /**
     * 更新用户信息
     * @param id 用户ID
     * @return 更新结果
     */
    @PutMapping("/{id}")
    public String updateUser(@PathVariable Long id) {
        return "This would update user with ID: " + id;
    }

    /**
     * 删除用户
     * @param id 用户ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        return "This would delete user with ID: " + id;
    }

    /**
     * 部分更新用户信息
     * @param id 用户ID
     * @return 更新结果
     */
    @PatchMapping("/{id}")
    public String patchUser(@PathVariable Long id) {
        return "This would partially update user with ID: " + id;
    }
} 
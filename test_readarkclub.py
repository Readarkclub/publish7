#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试 https://readarkclub.figma.site/ 网站
检查页面结构、元素和功能
"""

import sys
import io
# 设置 stdout 编码为 UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from playwright.sync_api import sync_playwright
import json

def test_readarkclub_site():
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = context.new_page()

        print("📱 正在访问网站...")

        try:
            # 访问网站
            page.goto('https://readarkclub.figma.site/', timeout=30000)

            # 等待页面加载完成
            page.wait_for_load_state('networkidle', timeout=30000)

            print("✅ 页面加载完成\n")

            # 截图
            screenshot_path = 'D:/claude/figma/publish7/readarkclub_screenshot.png'
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"📸 截图已保存: {screenshot_path}\n")

            # 获取页面标题
            title = page.title()
            print(f"📄 页面标题: {title}")

            # 获取页面 URL
            url = page.url
            print(f"🔗 当前 URL: {url}\n")

            # 检查主要元素
            print("🔍 检查页面元素:\n")

            # 查找所有标题
            headings = page.locator('h1, h2, h3, h4, h5, h6').all()
            print(f"标题数量: {len(headings)}")
            for i, heading in enumerate(headings[:10], 1):  # 只显示前10个
                text = heading.inner_text().strip()
                if text:
                    print(f"  {i}. {heading.evaluate('el => el.tagName')}: {text[:100]}")

            print()

            # 查找所有链接
            links = page.locator('a[href]').all()
            print(f"链接数量: {len(links)}")
            unique_hrefs = set()
            for link in links[:20]:  # 只显示前20个
                try:
                    href = link.get_attribute('href')
                    text = link.inner_text().strip()
                    if href and href not in unique_hrefs:
                        unique_hrefs.add(href)
                        print(f"  - {text[:50] if text else '(无文本)'}: {href}")
                except:
                    pass

            print()

            # 查找所有按钮
            buttons = page.locator('button, [role="button"], input[type="button"], input[type="submit"]').all()
            print(f"按钮数量: {len(buttons)}")
            for i, button in enumerate(buttons[:10], 1):
                try:
                    text = button.inner_text().strip() or button.get_attribute('aria-label') or button.get_attribute('title')
                    if text:
                        print(f"  {i}. {text[:50]}")
                except:
                    pass

            print()

            # 查找所有图片
            images = page.locator('img').all()
            print(f"图片数量: {len(images)}")
            for i, img in enumerate(images[:10], 1):
                try:
                    src = img.get_attribute('src')
                    alt = img.get_attribute('alt')
                    print(f"  {i}. {alt[:50] if alt else '(无 alt)'}: {src[:80] if src else '(无 src)'}...")
                except:
                    pass

            print()

            # 查找表单元素
            inputs = page.locator('input, textarea, select').all()
            print(f"表单元素数量: {len(inputs)}")
            for i, input_elem in enumerate(inputs[:10], 1):
                try:
                    input_type = input_elem.get_attribute('type') or 'text'
                    placeholder = input_elem.get_attribute('placeholder')
                    name = input_elem.get_attribute('name')
                    print(f"  {i}. Type: {input_type}, Name: {name}, Placeholder: {placeholder}")
                except:
                    pass

            print()

            # 检查导航栏
            nav = page.locator('nav, [role="navigation"]').first
            if nav.count() > 0:
                print("🧭 导航栏:")
                nav_links = nav.locator('a').all()
                for link in nav_links:
                    try:
                        text = link.inner_text().strip()
                        href = link.get_attribute('href')
                        if text:
                            print(f"  - {text}: {href}")
                    except:
                        pass
                print()

            # 获取页面的主要文本内容
            body_text = page.locator('body').inner_text()
            word_count = len(body_text.split())
            print(f"📝 页面文本字数: {word_count}\n")

            # 检查控制台日志
            console_messages = []
            page.on('console', lambda msg: console_messages.append({
                'type': msg.type,
                'text': msg.text
            }))

            # 等待一下看是否有控制台输出
            page.wait_for_timeout(2000)

            if console_messages:
                print("🖥️ 控制台消息:")
                for msg in console_messages[:10]:
                    print(f"  [{msg['type']}] {msg['text']}")
                print()

            # 检查是否有视频
            videos = page.locator('video').all()
            if videos:
                print(f"🎥 视频数量: {len(videos)}")
                for i, video in enumerate(videos[:5], 1):
                    src = video.get_attribute('src')
                    print(f"  {i}. {src}")
                print()

            # 检查是否是响应式设计
            print("📱 测试响应式设计:")

            # 移动端视图
            page.set_viewport_size({'width': 375, 'height': 667})
            page.wait_for_timeout(1000)
            mobile_screenshot = 'D:/claude/figma/publish7/readarkclub_mobile.png'
            page.screenshot(path=mobile_screenshot, full_page=True)
            print(f"  ✅ 移动端截图: {mobile_screenshot}")

            # 平板视图
            page.set_viewport_size({'width': 768, 'height': 1024})
            page.wait_for_timeout(1000)
            tablet_screenshot = 'D:/claude/figma/publish7/readarkclub_tablet.png'
            page.screenshot(path=tablet_screenshot, full_page=True)
            print(f"  ✅ 平板截图: {tablet_screenshot}")

            print("\n✅ 测试完成!")

        except Exception as e:
            print(f"❌ 错误: {e}")
            import traceback
            traceback.print_exc()

        finally:
            browser.close()

if __name__ == '__main__':
    test_readarkclub_site()

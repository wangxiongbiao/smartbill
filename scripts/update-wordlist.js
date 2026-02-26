#!/usr/bin/env node
/**
 * 自动更新 Wordle 词库脚本
 * 从 stuartpb/wordles 仓库拉取最新词库
 * 使用 CommonJS 格式 (独立于项目的 ES6 模块)
 */

import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 上游仓库的原始文件 URL
const UPSTREAM_URLS = {
  answers:
    "https://raw.githubusercontent.com/stuartpb/wordles/main/wordles.json",
  validGuesses:
    "https://raw.githubusercontent.com/stuartpb/wordles/main/nonwordles.json",
};

// 本地文件路径
const LOCAL_PATHS = {
  answers: path.join(__dirname, "..", "data", "answers.json"),
  validGuesses: path.join(__dirname, "..", "data", "validGuesses.json"),
};

/**
 * 从 URL 下载 JSON 数据
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(
              new Error(`Failed to parse JSON from ${url}: ${error.message}`)
            );
          }
        });
      })
      .on("error", (error) => {
        reject(new Error(`Failed to fetch ${url}: ${error.message}`));
      });
  });
}

/**
 * 比较两个数组是否相同
 */
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

/**
 * 更新词库文件
 */
async function updateWordlist(type) {
  console.log(`\n📥 Fetching ${type} from upstream...`);

  try {
    // 下载最新数据
    const newData = await fetchJSON(UPSTREAM_URLS[type]);
    console.log(`✅ Downloaded ${newData.length} words`);

    // 读取本地数据
    let oldData = [];
    if (fs.existsSync(LOCAL_PATHS[type])) {
      oldData = JSON.parse(fs.readFileSync(LOCAL_PATHS[type], "utf8"));
      console.log(`📂 Local file has ${oldData.length} words`);
    } else {
      console.log(`📂 Local file does not exist, will create new one`);
    }

    // 比较数据
    if (arraysEqual(oldData, newData)) {
      console.log(`✨ No changes detected for ${type}`);
      return { updated: false, type };
    }

    // 写入新数据
    fs.writeFileSync(
      LOCAL_PATHS[type],
      JSON.stringify(newData, null, 2) + "\n",
      "utf8"
    );

    const diff = newData.length - oldData.length;
    const diffStr = diff > 0 ? `+${diff}` : diff.toString();
    console.log(
      `✅ Updated ${type}: ${oldData.length} → ${newData.length} (${diffStr} words)`
    );

    return {
      updated: true,
      type,
      oldCount: oldData.length,
      newCount: newData.length,
      diff,
    };
  } catch (error) {
    console.error(`❌ Error updating ${type}:`, error.message);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("🔄 Wordle Wordlist Update Script");
  console.log("================================\n");
  console.log("📍 Source: https://github.com/stuartpb/wordles\n");

  try {
    // 更新答案词库
    const answersResult = await updateWordlist("answers");

    // 更新有效猜测词库
    const validGuessesResult = await updateWordlist("validGuesses");

    // 输出总结
    console.log("\n📊 Update Summary");
    console.log("=================");

    const results = [answersResult, validGuessesResult];
    const hasUpdates = results.some((r) => r.updated);

    if (hasUpdates) {
      console.log("✅ Wordlist updated successfully!");
      results.forEach((r) => {
        if (r.updated) {
          console.log(
            `   - ${r.type}: ${r.oldCount} → ${r.newCount} (${
              r.diff > 0 ? "+" : ""
            }${r.diff})`
          );
        }
      });
    } else {
      console.log("✨ All wordlists are up to date!");
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Update failed:", error.message);
    process.exit(1);
  }
}

// 运行主函数
main();

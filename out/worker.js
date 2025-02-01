import {
  AutoTokenizer,
  AutoModelForCausalLM,
  TextStreamer,
  InterruptableStoppingCriteria,
} from "@huggingface/transformers";

console.log('Imported dependencies');

async function check() {
  console.log('Running WebGL check');
  try {
    const canvas = new OffscreenCanvas(256, 256);
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      throw new Error("WebGL is not supported");
    }
    console.log('WebGL is supported');
  } catch (e) {
    console.error('WebGL check failed:', e);
    self.postMessage({
      status: "error",
      data: e.toString(),
    });
  }
}

class TextGenerationPipeline {
  static model_id = "onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX";

  static async getInstance(progress_callback = null) {
    console.log('Getting pipeline instance');
    try {
      this.tokenizer ??= await AutoTokenizer.from_pretrained(this.model_id, {
        progress_callback,
      });
      console.log('Tokenizer loaded successfully');

      this.model ??= await AutoModelForCausalLM.from_pretrained(this.model_id, {
        dtype: "q4f16",
        device: "webgl",
        progress_callback,
      });
      console.log('Model loaded successfully');

      return [this.tokenizer, this.model];
    } catch (error) {
      console.error('Failed to load model:', error);
      self.postMessage({
        status: "error",
        data: `Model loading failed: ${error.message}`
      });
      throw error;
    }
  }
}

async function load() {
  console.log('Starting model load');
  self.postMessage({ status: "loading", data: "Loading model..." });

  try {
    const [tokenizer, model] = await TextGenerationPipeline.getInstance(handleProgress);
    console.log('Model loaded successfully');

    self.postMessage({ status: "loading", data: "Compiling shaders and warming up model..." });
    const inputs = tokenizer("a");
    console.log('Warmup inputs:', inputs);
    await model.generate({ ...inputs, max_new_tokens: 1 });
    console.log('Warmup complete');
    self.postMessage({ status: "ready" });
  } catch (error) {
    console.error('Model load failed:', error);
    self.postMessage({
      status: "error",
      data: `Model load failed: ${error.message}`
    });
  }
}

self.addEventListener("message", async (e) => {
  const { type, data } = e.data;
  console.log('Received message:', type, data);

  switch (type) {
    case "check":
      check();
      break;
    case "load":
      load();
      break;
    case "generate":
      stopping_criteria.reset();
      generate(data);
      break;
    case "interrupt":
      console.log('Interrupting generation');
      stopping_criteria.interrupt();
      break;
    case "reset":
      console.log('Resetting state');
      past_key_values_cache = null;
      stopping_criteria.reset();
      break;
  }
});

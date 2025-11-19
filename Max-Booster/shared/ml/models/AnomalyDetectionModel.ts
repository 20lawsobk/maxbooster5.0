/**
 * Custom Anomaly Detection Model
 * Hybrid approach: Statistical baseline + Autoencoder neural network
 */

import * as tf from '@tensorflow/tfjs';
import { BaseModel } from './BaseModel.js';
import { calculateStatistics, detectOutliersIQR, detectOutliersZScore } from '../statistics/core.js';
import type { AnomalyResult } from '../types.js';

export class AnomalyDetectionModel extends BaseModel {
  private autoencoderModel: tf.LayersModel | null = null;
  private reconstructionThreshold: number = 0;
  private statisticalBaseline: { mean: number; std: number } | null = null;

  constructor() {
    super({
      name: 'AnomalyDetector',
      type: 'anomaly',
      version: '1.0.0',
      inputShape: [10], // Feature vector size
      outputShape: [10],
    });
  }

  /**
   * Build autoencoder for anomaly detection
   */
  protected buildModel(): tf.LayersModel {
    // Encoder
    const encoder = tf.sequential({
      layers: [
        tf.layers.dense({ units: 8, activation: 'relu', inputShape: [10] }),
        tf.layers.dense({ units: 4, activation: 'relu' }),
        tf.layers.dense({ units: 2, activation: 'relu' }), // Bottleneck
      ],
    });

    // Decoder
    const decoder = tf.sequential({
      layers: [
        tf.layers.dense({ units: 4, activation: 'relu', inputShape: [2] }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 10, activation: 'linear' }), // Reconstruct input
      ],
    });

    // Full autoencoder
    const autoencoder = tf.sequential();
    autoencoder.add(encoder);
    autoencoder.add(decoder);

    autoencoder.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
    });

    this.autoencoderModel = autoencoder;
    return autoencoder;
  }

  /**
   * Train on normal data
   */
  public async trainOnNormalData(normalData: number[][]): Promise<void> {
    if (!this.model) {
      await this.initialize();
    }

    if (!this.model) {
      throw new Error('Model initialization failed');
    }

    // Calculate statistical baseline
    const allValues = normalData.flat();
    const stats = calculateStatistics(allValues);
    this.statisticalBaseline = { mean: stats.mean, std: stats.stdDev };

    // Train autoencoder to reconstruct normal data
    const inputTensor = tf.tensor2d(normalData);

    try {
      await this.model.fit(inputTensor, inputTensor, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 0,
      });

      // Calculate reconstruction threshold (95th percentile of reconstruction errors)
      const predictions = this.model.predict(inputTensor) as tf.Tensor;
      const reconstructionErrors = tf.losses.meanSquaredError(inputTensor, predictions);
      const errors = await reconstructionErrors.data();
      
      const sortedErrors = Array.from(errors).sort((a, b) => a - b);
      this.reconstructionThreshold = sortedErrors[Math.floor(sortedErrors.length * 0.95)];

      this.isTrained = true;
      this.metadata.lastTrained = new Date();
    } finally {
      inputTensor.dispose();
    }
  }

  /**
   * Detect anomalies in data
   */
  public async detectAnomalies(data: number[]): Promise<AnomalyResult[]> {
    if (!this.isTrained || !this.statisticalBaseline) {
      throw new Error('Model must be trained before detecting anomalies');
    }

    const results: AnomalyResult[] = [];

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      const result = await this.isAnomaly(value, data, i);
      
      if (result.isAnomaly) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Check if a single value is anomalous
   */
  private async isAnomaly(
    value: number,
    context: number[],
    index: number
  ): Promise<AnomalyResult> {
    if (!this.statisticalBaseline) {
      throw new Error('Statistical baseline not calculated');
    }

    // Statistical detection (Z-score)
    const { mean, std } = this.statisticalBaseline;
    const zScore = Math.abs((value - mean) / (std || 1));
    const isStatisticalAnomaly = zScore > 3;

    // Neural network detection (if we have enough context)
    let isNeuralAnomaly = false;
    let reconstructionError = 0;

    if (context.length >= 10 && this.model) {
      const features = this.extractFeatures(value, context, index);
      const inputTensor = tf.tensor2d([features]);

      try {
        const prediction = this.model.predict(inputTensor) as tf.Tensor;
        const error = tf.losses.meanSquaredError(inputTensor, prediction);
        reconstructionError = (await error.data())[0];
        isNeuralAnomaly = reconstructionError > this.reconstructionThreshold;
      } finally {
        inputTensor.dispose();
      }
    }

    // Combine both methods
    const isAnomaly = isStatisticalAnomaly || isNeuralAnomaly;

    // Calculate severity
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (zScore > 5 || reconstructionError > this.reconstructionThreshold * 2) {
      severity = 'high';
    } else if (zScore > 4 || reconstructionError > this.reconstructionThreshold * 1.5) {
      severity = 'medium';
    }

    // Determine anomaly type
    const isSpike = value > mean + 3 * std;
    const isDrop = value < mean - 3 * std;

    let description = '';
    if (isSpike) {
      description = `Unusual spike: ${value.toFixed(2)} (expected ~${mean.toFixed(2)})`;
    } else if (isDrop) {
      description = `Unusual drop: ${value.toFixed(2)} (expected ~${mean.toFixed(2)})`;
    } else {
      description = `Pattern anomaly detected at index ${index}`;
    }

    return {
      isAnomaly,
      score: Math.max(zScore / 5, reconstructionError / this.reconstructionThreshold),
      severity,
      expectedValue: mean,
      actualValue: value,
      description,
    };
  }

  /**
   * Extract features for neural network
   */
  private extractFeatures(value: number, context: number[], index: number): number[] {
    const features: number[] = [];

    // Current value
    features.push(value);

    // Previous values (up to 5)
    for (let i = 1; i <= 5; i++) {
      features.push(context[index - i] || 0);
    }

    // Statistics of recent window
    const recentWindow = context.slice(Math.max(0, index - 10), index);
    if (recentWindow.length > 0) {
      const recentMean = recentWindow.reduce((sum, val) => sum + val, 0) / recentWindow.length;
      const recentMax = Math.max(...recentWindow);
      const recentMin = Math.min(...recentWindow);

      features.push(recentMean, recentMax, recentMin);
    } else {
      features.push(0, 0, 0);
    }

    // Pad to feature vector size
    while (features.length < 10) {
      features.push(0);
    }

    return features.slice(0, 10);
  }

  /**
   * Batch anomaly detection with statistical methods
   */
  public detectAnomaliesStatistical(data: number[]): AnomalyResult[] {
    const stats = calculateStatistics(data);
    const { outliers } = detectOutliersIQR(data);

    return outliers.map(value => {
      const zScore = Math.abs((value - stats.mean) / (stats.stdDev || 1));
      
      return {
        isAnomaly: true,
        score: zScore / 5,
        severity: zScore > 5 ? 'high' : zScore > 4 ? 'medium' : 'low',
        expectedValue: stats.mean,
        actualValue: value,
        description: `Statistical outlier: ${value.toFixed(2)}`,
      };
    });
  }

  protected preprocessInput(input: any): tf.Tensor {
    return tf.tensor2d([input]);
  }

  protected postprocessOutput(output: tf.Tensor): any {
    return Array.from(output.dataSync());
  }
}

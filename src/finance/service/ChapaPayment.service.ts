import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
export interface ChapaBanks {
  id: string;
  slug: string;
  swift: string;
  name: string;
  acct_length: number;
  country_id: number;
  is_mobilemoney: number;
  is_active: number;
  is_rtgs: number;
  active: number;
  is_24hrs: number;
  created_at: string;
  updated_at: string;
  currency: string;
}
export interface ChapaBanksResponse {
  message: string;
  data: ChapaBanks[];
}
export interface ChapaTransferResponse {
  message: string;
  status: 'success' | 'failed';
  data: string;
}
@Injectable()
export class ChapaPaymentService {
  private baseUrl: string;
  private authenticationKey: string;
  private merchantId: string;
  constructor(private readonly configService: ConfigService) {
    this.baseUrl = configService.get<string>('CHAPA_BASE_URL') || '';
    this.authenticationKey =
      this.configService.get<string>('CHAPA_AUTHENTICATION_KEY') || '';
  }
  async withDrawMoney(withDrawData: {
    account_name?: string;
    account_number: string;
    amount: number;
    bank_code: string;
    reference: string;
  }) {
    try {
      const url = `${this.baseUrl}/transfers`;
      const response = await axios.post(url, withDrawData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.authenticationKey}`,
        },
      });
      const resData: ChapaTransferResponse = response.data;
      if (resData.status == 'success') {
        return response.data;
      } else {
        throw new BadRequestException('CHAPA ERROR');
      }
    } catch (error: any) {
      if (error.response) {
        const data = error?.response?.data;
        let errorString = 'CHAPA ERROR';

        if (data && typeof data === 'object') {
          errorString = Object.entries(data)
            .map(([key, messages]) => {
              if (Array.isArray(messages)) {
                return `${key}: ${messages.join(', ')}`;
              }

              if (typeof messages === 'string') {
                return `${key}: ${messages}`;
              }

              if (typeof messages === 'object' && messages !== null) {
                return `${key}: ${JSON.stringify(messages)}`;
              }

              return `${key}: ${String(messages)}`;
            })
            .join(' | ');
        }

        throw new BadRequestException(errorString);
      }
      throw new BadRequestException(error.message);
    }
  }
  async getBanks(): Promise<ChapaBanks[]> {
    try {
      const url = `${this.baseUrl}/banks`;
      console.log('Base url ', url);
      const chapaResponse = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.authenticationKey}`,
        },
      });
      const response: ChapaBanksResponse = chapaResponse.data;
      if (response.data) {
        return response.data;
      } else {
        throw new InternalServerErrorException('Chapa is not responding');
      }
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException('Chapa ERROR');
    }
  }
}
